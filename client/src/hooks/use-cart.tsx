import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  addedAt: string;
  product: {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
    description: string;
    stockQuantity: number;
  };
}

export function useCart() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Get cart items
  const { data: cartItems, isLoading, error } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });
  
  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      const res = await apiRequest("POST", "/api/cart", { productId, quantity });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: `${data.product.name} has been added to your cart`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add to cart",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update cart item mutation
  const updateCartItemMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      const res = await apiRequest("PUT", `/api/cart/${itemId}`, { quantity });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update cart",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Remove cart item mutation
  const removeCartItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await apiRequest("DELETE", `/api/cart/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item removed",
        description: "The item has been removed from your cart",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove item",
        description: error.message,
        variant: "destructive",
      });
    },
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
  
  // Calculate cart totals
  const calculateCartTotals = () => {
    if (!cartItems || !cartItems.length) {
      return { subtotal: 0, tax: 0, shipping: 0, total: 0, itemCount: 0 };
    }
    
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);
    
    // Calculate tax (assuming 8% tax rate)
    const tax = Math.round(subtotal * 0.08);
    
    // Calculate shipping (free over $300)
    const shipping = subtotal >= 30000 ? 0 : 1500;
    
    // Calculate total item count
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    return {
      subtotal,
      tax,
      shipping,
      total: subtotal + tax + shipping,
      itemCount
    };
  };

  return {
    cartItems,
    isLoading,
    error,
    addToCart: addToCartMutation.mutate,
    updateCartItem: updateCartItemMutation.mutate,
    removeCartItem: removeCartItemMutation.mutate,
    clearCart: clearCartMutation.mutate,
    cartTotals: calculateCartTotals(),
    isAddingToCart: addToCartMutation.isPending,
    isUpdatingCart: updateCartItemMutation.isPending,
    isRemovingFromCart: removeCartItemMutation.isPending,
    isClearingCart: clearCartMutation.isPending,
  };
}
