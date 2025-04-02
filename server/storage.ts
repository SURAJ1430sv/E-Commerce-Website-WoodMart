import { 
  User, InsertUser, 
  Product, InsertProduct, 
  Category, InsertCategory,
  CartItem, InsertCartItem,
  Order, InsertOrder,
  OrderItem, InsertOrderItem,
  users, products, categories, cartItems, orders, orderItems
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { pool } from "./db";
import { eq, and, like, desc, sql } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

// Extend the storage interface with all required CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  setPasswordResetToken(email: string, token: string, expiry: Date): Promise<boolean>;
  resetPassword(token: string, newPassword: string): Promise<boolean>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryByName(name: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product methods
  getProducts(filters?: {categoryId?: number, supplierId?: number, featured?: boolean}): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  searchProducts(query: string): Promise<Product[]>;
  
  // Cart methods
  getCartItems(userId: number): Promise<CartItem[]>;
  getCartItem(userId: number, productId: number): Promise<CartItem | undefined>;
  addCartItem(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
  
  // Order methods
  getOrders(userId: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'): Promise<Order | undefined>;
  
  // Order item methods
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Session store
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
    
    // Initialize categories if needed
    this.initializeCategories();
  }
  
  private async initializeCategories() {
    // Check if categories exist
    const existingCategories = await db.select().from(categories);
    if (existingCategories.length === 0) {
      // Add default categories
      const defaultCategories = [
        { name: "Marine Plywood", icon: "warehouse" },
        { name: "Structural Plywood", icon: "home" },
        { name: "Decorative Plywood", icon: "layers" },
        { name: "Construction Plywood", icon: "tools" }
      ];
      
      for (const category of defaultCategories) {
        await db.insert(categories).values(category);
      }
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.resetToken, token));
    return user;
  }
  
  async setPasswordResetToken(email: string, token: string, expiry: Date): Promise<boolean> {
    // Check if user exists
    const user = await this.getUserByEmail(email);
    if (!user) {
      return false;
    }
    
    // Set the reset token and expiry
    const result = await db
      .update(users)
      .set({
        resetToken: token,
        resetTokenExpiry: expiry
      })
      .where(eq(users.email, email));
      
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    // Find user by token
    const user = await this.getUserByResetToken(token);
    if (!user) {
      return false;
    }
    
    // Check if token is expired
    if (user.resetTokenExpiry && new Date(user.resetTokenExpiry) < new Date()) {
      return false;
    }
    
    // Update password and clear token
    const result = await db
      .update(users)
      .set({
        password: newPassword,
        resetToken: null,
        resetTokenExpiry: null
      })
      .where(eq(users.id, user.id));
      
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  // Category methods
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));
    return category;
  }
  
  async getCategoryByName(name: string): Promise<Category | undefined> {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.name, name));
    return category;
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }
  
  // Product methods
  async getProducts(filters?: {categoryId?: number, supplierId?: number, featured?: boolean}): Promise<Product[]> {
    let conditions = [];
    
    if (filters) {
      if (filters.categoryId !== undefined) {
        conditions.push(eq(products.categoryId, filters.categoryId));
      }
      
      if (filters.supplierId !== undefined) {
        conditions.push(eq(products.supplierId, filters.supplierId));
      }
      
      if (filters.featured !== undefined) {
        conditions.push(eq(products.isFeatured, filters.featured));
      }
    }
    
    if (conditions.length > 0) {
      return db.select().from(products).where(and(...conditions));
    }
    
    return db.select().from(products);
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    return product;
  }
  
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }
  
  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set(productData)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    const result = await db
      .delete(products)
      .where(eq(products.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  async searchProducts(query: string): Promise<Product[]> {
    // Using ILIKE for case-insensitive search
    return db
      .select()
      .from(products)
      .where(
        sql`${products.name} ILIKE ${'%' + query + '%'} OR ${products.description} ILIKE ${'%' + query + '%'}`
      );
  }
  
  // Cart methods
  async getCartItems(userId: number): Promise<CartItem[]> {
    return db
      .select()
      .from(cartItems)
      .where(eq(cartItems.userId, userId));
  }
  
  async getCartItem(userId: number, productId: number): Promise<CartItem | undefined> {
    const [cartItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, userId),
          eq(cartItems.productId, productId)
        )
      );
    return cartItem;
  }
  
  async addCartItem(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists for this user and product
    const existingItem = await this.getCartItem(insertCartItem.userId, insertCartItem.productId);
    
    if (existingItem) {
      // Update quantity if item already in cart
      return this.updateCartItem(existingItem.id, existingItem.quantity + insertCartItem.quantity) as Promise<CartItem>;
    }
    
    // Add new item
    const [cartItem] = await db
      .insert(cartItems)
      .values(insertCartItem)
      .returning();
    return cartItem;
  }
  
  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    // Remove item if quantity is 0
    if (quantity <= 0) {
      await db
        .delete(cartItems)
        .where(eq(cartItems.id, id));
      return undefined;
    }
    
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem;
  }
  
  async removeCartItem(id: number): Promise<boolean> {
    const result = await db
      .delete(cartItems)
      .where(eq(cartItems.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  async clearCart(userId: number): Promise<boolean> {
    await db
      .delete(cartItems)
      .where(eq(cartItems.userId, userId));
    return true;
  }
  
  // Order methods
  async getOrders(userId: number): Promise<Order[]> {
    return db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }
  
  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id));
    return order;
  }
  
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values(insertOrder)
      .returning();
    return order;
  }
  
  async updateOrderStatus(id: number, status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }
  
  // Order item methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
  }
  
  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const [orderItem] = await db
      .insert(orderItems)
      .values(insertOrderItem)
      .returning();
    return orderItem;
  }
}

// Export the database storage instance instead of memory storage
export const storage = new DatabaseStorage();
