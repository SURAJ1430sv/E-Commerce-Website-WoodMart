import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { z } from "zod";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "woodmarket-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Try to find user by username first
        let user = await storage.getUserByUsername(username);
        
        // If not found, try by email
        if (!user) {
          user = await storage.getUserByEmail(username);
        }
        
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Registration validation schema
  const registrationSchema = z.object({
    username: z.string().min(3).max(50),
    email: z.string().email(),
    password: z.string().min(6),
    fullName: z.string().min(2),
    role: z.enum(["customer", "supplier"])
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Validate registration data
      const validatedData = registrationSchema.parse(req.body);
      
      // Check if username exists
      const existingUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if email exists
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Create user with hashed password
      const user = await storage.createUser({
        ...validatedData,
        password: await hashPassword(validatedData.password),
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      // Log in the user after registration
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: SelectUser | false, info: { message: string } | undefined) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user as SelectUser;
    res.json(userWithoutPassword);
  });
  
  // Password reset request
  app.post("/api/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // For security reasons, don't reveal if email exists or not
        return res.status(200).json({ message: "If an account with that email exists, a password reset link has been sent." });
      }
      
      // Generate reset token (random bytes)
      const resetToken = randomBytes(32).toString("hex");
      
      // Set expiry (1 hour from now)
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
      
      // Save token and expiry to database
      await storage.setPasswordResetToken(email, resetToken, resetTokenExpiry);
      
      // In a real application, send an email with the reset link
      // For now, we'll just return the token in the response for testing purposes
      res.status(200).json({ 
        message: "If an account with that email exists, a password reset link has been sent.",
        // IMPORTANT: In production, don't expose the token in the response
        // Only for development/testing purposes
        resetToken 
      });
    } catch (error) {
      console.error("Error in forgot password:", error);
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });
  
  // Password reset validation schema
  const resetPasswordSchema = z.object({
    token: z.string().min(1, "Reset token is required"),
    password: z.string().min(6, "Password must be at least 6 characters")
  });
  
  // Reset password with token
  app.post("/api/reset-password", async (req, res) => {
    try {
      // Validate input
      const validatedData = resetPasswordSchema.parse(req.body);
      const { token, password } = validatedData;
      
      // Hash the new password
      const hashedPassword = await hashPassword(password);
      
      // Reset the password
      const success = await storage.resetPassword(token, hashedPassword);
      
      if (!success) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      
      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error in reset password:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });
}
