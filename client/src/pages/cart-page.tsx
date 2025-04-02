import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Loader2, ShoppingCart, ArrowRight, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import CartItem from "@/components/cart/cart-item";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function CartPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // Get cart items with product details
  const { data: cartItems, isLoading, error } = useQuery({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/cart");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to clear cart",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      setIsCreatingOrder(true);
      const res = await apiRequest("POST", "/api/orders", {});
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Order created successfully",
        description: "Your order has been placed and is being processed",
      });
      navigate(`/profile?order=${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create order",
        description: error.message,
        variant: "destructive",
      });
      setIsCreatingOrder(false);
    },
  });

  // Calculate cart totals
  const calculateCartTotals = () => {
    if (!cartItems || !cartItems.length) return { subtotal: 0, tax: 0, shipping: 0, total: 0 };
    
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);
    
    // Calculate tax (assuming 8% tax rate)
    const tax = Math.round(subtotal * 0.08);
    
    // Calculate shipping (free over $300)
    const shipping = subtotal >= 30000 ? 0 : 1500;
    
    return {
      subtotal,
      tax,
      shipping,
      total: subtotal + tax + shipping
    };
  };

  const { subtotal, tax, shipping, total } = calculateCartTotals();

  // Format price from cents to dollars
  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  // Handle checkout
  const handleCheckout = () => {
    if (!cartItems || cartItems.length === 0) {
      toast({
        title: "Empty cart",
        description: "Please add items to your cart before checking out",
        variant: "destructive",
      });
      return;
    }

    createOrderMutation.mutate();
  };

  // Handle clear cart
  const handleClearCart = () => {
    if (!cartItems || cartItems.length === 0) return;
    
    clearCartMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            There was an error loading your cart. Please try again later.
          </AlertDescription>
        </Alert>
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  // Empty cart
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Cart</h1>
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex justify-center mb-4">
              <ShoppingCart className="h-16 w-16 text-gray-300" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Button asChild className="bg-primary hover:bg-primary-dark">
              <Link href="/products">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Cart Items ({cartItems.length})</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                  onClick={handleClearCart}
                  disabled={clearCartMutation.isPending}
                >
                  {clearCartMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-1" />
                  )}
                  Clear Cart
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </CardContent>
            <CardFooter className="flex justify-between pt-4 border-t">
              <Button variant="outline" asChild>
                <Link href="/products">Continue Shopping</Link>
              </Button>
              <span className="text-sm text-gray-500">
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items in your cart
              </span>
            </CardFooter>
          </Card>
        </div>
        
        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (8%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              
              {shipping > 0 && (
                <div className="text-sm text-gray-500 mt-2">
                  Add {formatPrice(30000 - subtotal)} more to qualify for free shipping.
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-primary hover:bg-primary-dark flex items-center justify-center"
                onClick={handleCheckout}
                disabled={isCreatingOrder || createOrderMutation.isPending}
              >
                {isCreatingOrder || createOrderMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-md p-4">
            <h3 className="font-medium text-amber-800 mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              Demo Mode
            </h3>
            <p className="text-sm text-amber-700">
              This is a demo app. No real payment will be processed. Clicking "Checkout" will simulate order creation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
