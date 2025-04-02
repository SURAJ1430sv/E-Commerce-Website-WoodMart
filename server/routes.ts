import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import Stripe from "stripe";
import {
  insertProductSchema,
  insertCartItemSchema,
  insertOrderSchema,
  insertOrderItemSchema
} from "@shared/schema";

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing Stripe secret key. Please add STRIPE_SECRET_KEY to your environment variables.');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Authentication middleware
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
};

// Role check middleware
const hasRole = (role: 'customer' | 'supplier') => {
  return (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    if (req.user && req.user.role === role) {
      return next();
    }
    
    res.status(403).json({ message: "Access denied. Required role: " + role });
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // ======== Category Routes ========
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Error fetching categories" });
    }
  });

  // ======== Product Routes ========
  // Get all products with optional filters
  app.get("/api/products", async (req, res) => {
    try {
      const { categoryId, supplierId, featured } = req.query;
      
      const filters: { categoryId?: number; supplierId?: number; isFeatured?: boolean } = {};
      
      if (categoryId) filters.categoryId = parseInt(categoryId as string);
      if (supplierId) filters.supplierId = parseInt(supplierId as string);
      if (featured === 'true') filters.isFeatured = true;
      
      const products = await storage.getProducts(Object.keys(filters).length > 0 ? filters : undefined);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching products" });
    }
  });
  
  // Get supplier's products (this must come BEFORE the :id route)
  app.get("/api/products/supplier", isAuthenticated, hasRole('supplier'), async (req, res) => {
    try {
      const products = await storage.getProducts({ supplierId: req.user!.id });
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching supplier products" });
    }
  });
  
  // Search products (this must come BEFORE the :id route)
  app.get("/api/products/search/:query", async (req, res) => {
    try {
      const query = req.params.query;
      const products = await storage.searchProducts(query);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Error searching products" });
    }
  });
  
  // Get a single product
  app.get("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Error fetching product" });
    }
  });
  
  // Create a new product (supplier only)
  app.post("/api/products", isAuthenticated, hasRole('supplier'), async (req, res) => {
    try {
      console.log('Product creation request received:', req.body);
      
      // Create a complete product object with the supplier ID
      const productData = {
        ...req.body,
        supplierId: req.user!.id
      };
      
      console.log('Product data after adding supplierId:', productData);
      
      // Validate the data
      const validatedData = insertProductSchema.parse(productData);
      
      console.log('Product data after validation:', validatedData);
      
      const product = await storage.createProduct(validatedData);
      
      console.log('Product created successfully:', product);
      res.status(201).json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors,
          details: error.format() 
        });
      }
      res.status(500).json({ message: "Error creating product" });
    }
  });
  
  // Update a product (supplier only, and only their own products)
  app.put("/api/products/:id", isAuthenticated, hasRole('supplier'), async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check if product belongs to this supplier
      if (product.supplierId !== req.user!.id) {
        return res.status(403).json({ message: "You can only update your own products" });
      }
      
      const updateData = insertProductSchema.partial().parse(req.body);
      const updatedProduct = await storage.updateProduct(productId, updateData);
      
      res.json(updatedProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating product" });
    }
  });
  
  // Delete a product (supplier only, and only their own products)
  app.delete("/api/products/:id", isAuthenticated, hasRole('supplier'), async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check if product belongs to this supplier
      if (product.supplierId !== req.user!.id) {
        return res.status(403).json({ message: "You can only delete your own products" });
      }
      
      await storage.deleteProduct(productId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting product" });
    }
  });
  


  // ======== Cart Routes ========
  // Get user's cart
  app.get("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const cartItems = await storage.getCartItems(req.user!.id);
      
      // Get product details for each cart item
      const cartWithProducts = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product
          };
        })
      );
      
      res.json(cartWithProducts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching cart" });
    }
  });
  
  // Add item to cart
  app.post("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      // Verify product exists
      const product = await storage.getProduct(cartItemData.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check stock quantity
      if (product.stockQuantity < cartItemData.quantity) {
        return res.status(400).json({ 
          message: "Not enough stock available",
          availableStock: product.stockQuantity
        });
      }
      
      const cartItem = await storage.addCartItem(cartItemData);
      
      // Return the cart item with the product details
      const cartItemWithProduct = {
        ...cartItem,
        product
      };
      
      res.status(201).json(cartItemWithProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error adding item to cart" });
    }
  });
  
  // Update cart item quantity
  app.put("/api/cart/:id", isAuthenticated, async (req, res) => {
    try {
      const cartItemId = parseInt(req.params.id);
      const { quantity } = req.body;
      
      if (typeof quantity !== 'number' || quantity < 0) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      
      // Get cart item to verify ownership
      const existingItems = await storage.getCartItems(req.user!.id);
      const cartItem = existingItems.find(item => item.id === cartItemId);
      
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found or does not belong to you" });
      }
      
      // Update quantity
      const updatedItem = await storage.updateCartItem(cartItemId, quantity);
      
      if (!updatedItem) {
        return res.status(200).json({ message: "Item removed from cart" });
      }
      
      // Get product details
      const product = await storage.getProduct(updatedItem.productId);
      
      res.json({
        ...updatedItem,
        product
      });
    } catch (error) {
      res.status(500).json({ message: "Error updating cart item" });
    }
  });
  
  // Remove item from cart
  app.delete("/api/cart/:id", isAuthenticated, async (req, res) => {
    try {
      const cartItemId = parseInt(req.params.id);
      
      // Get cart item to verify ownership
      const existingItems = await storage.getCartItems(req.user!.id);
      const cartItem = existingItems.find(item => item.id === cartItemId);
      
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found or does not belong to you" });
      }
      
      await storage.removeCartItem(cartItemId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error removing item from cart" });
    }
  });
  
  // Clear cart
  app.delete("/api/cart", isAuthenticated, async (req, res) => {
    try {
      await storage.clearCart(req.user!.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error clearing cart" });
    }
  });

  // ======== Payment Routes ========
  // Create a payment intent for Stripe checkout
  app.post("/api/create-payment-intent", isAuthenticated, async (req, res) => {
    try {
      const { amount } = req.body;

      if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount + (amount * 0.1)), // Adding 10% tax
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          userId: req.user!.id.toString(),
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({ 
        message: "Error creating payment intent",
        error: error.message 
      });
    }
  });

  // ======== Order Routes ========
  // Get user's orders
  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const orders = await storage.getOrders(req.user!.id);
      
      // Get order items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getOrderItems(order.id);
          
          // Get product details for each order item
          const itemsWithProducts = await Promise.all(
            items.map(async (item) => {
              const product = await storage.getProduct(item.productId);
              return {
                ...item,
                product
              };
            })
          );
          
          return {
            ...order,
            items: itemsWithProducts
          };
        })
      );
      
      res.json(ordersWithItems);
    } catch (error) {
      res.status(500).json({ message: "Error fetching orders" });
    }
  });
  
  // Get a single order
  app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if order belongs to this user
      if (order.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Get order items
      const items = await storage.getOrderItems(orderId);
      
      // Get product details for each order item
      const itemsWithProducts = await Promise.all(
        items.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product
          };
        })
      );
      
      res.json({
        ...order,
        items: itemsWithProducts
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching order" });
    }
  });
  
  // Create a new order
  app.post("/api/orders", isAuthenticated, async (req, res) => {
    try {
      // Get user's cart
      const cartItems = await storage.getCartItems(req.user!.id);
      
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cannot create an order with an empty cart" });
      }
      
      // Calculate total amount
      let totalAmount = 0;
      const orderProducts = [];
      
      for (const cartItem of cartItems) {
        const product = await storage.getProduct(cartItem.productId);
        
        if (!product) {
          return res.status(400).json({ 
            message: `Product with ID ${cartItem.productId} not found`
          });
        }
        
        // Check stock availability
        if (product.stockQuantity < cartItem.quantity) {
          return res.status(400).json({ 
            message: `Not enough stock for "${product.name}"`,
            availableStock: product.stockQuantity,
            productId: product.id
          });
        }
        
        totalAmount += product.price * cartItem.quantity;
        orderProducts.push({ 
          product, 
          quantity: cartItem.quantity 
        });
      }
      
      // Create order
      const orderData = {
        userId: req.user!.id,
        totalAmount,
        status: 'pending' as const
      };
      
      const order = await storage.createOrder(orderData);
      
      // Create order items
      for (const { product, quantity } of orderProducts) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: product.id,
          quantity,
          unitPrice: product.price
        });
        
        // Update product stock
        await storage.updateProduct(product.id, {
          stockQuantity: product.stockQuantity - quantity
        });
      }
      
      // Clear cart
      await storage.clearCart(req.user!.id);
      
      // Return the created order with items
      const items = await storage.getOrderItems(order.id);
      
      res.status(201).json({
        ...order,
        items
      });
    } catch (error) {
      res.status(500).json({ message: "Error creating order" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
