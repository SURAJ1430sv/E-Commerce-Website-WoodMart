import { useState } from 'react';
import { Link } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { Minus, Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface CartItemProps {
  item: {
    id: number;
    productId: number;
    quantity: number;
    product: {
      id: number;
      name: string;
      price: number;
      imageUrl: string;
      stockQuantity: number;
    };
  };
}

export default function CartItem({ item }: CartItemProps) {
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(item.quantity);

  // Update cart item mutation
  const updateCartMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      const res = await apiRequest('PUT', `/api/cart/${id}`, { quantity });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: (error: Error) => {
      // Reset quantity on error
      setQuantity(item.quantity);
      toast({
        title: 'Failed to update cart',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Remove cart item mutation
  const removeCartMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: 'Item removed',
        description: 'The item has been removed from your cart',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to remove item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle quantity change
  const changeQuantity = (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > item.product.stockQuantity) return;
    
    setQuantity(newQuantity);
    updateCartMutation.mutate({ id: item.id, quantity: newQuantity });
  };

  // Handle remove item
  const handleRemove = () => {
    removeCartMutation.mutate(item.id);
  };

  // Format price from cents to dollars
  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="py-4">
      <div className="flex items-start gap-4">
        <Link href={`/products/${item.product.id}`}>
          <a className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
            <img 
              src={item.product.imageUrl} 
              alt={item.product.name} 
              className="w-full h-full object-cover" 
            />
          </a>
        </Link>
        
        <div className="flex-1 min-w-0">
          <Link href={`/products/${item.product.id}`}>
            <a className="font-medium text-gray-800 hover:text-primary">
              {item.product.name}
            </a>
          </Link>
          <div className="flex items-center mt-1">
            <span className="text-primary-dark font-semibold">
              {formatPrice(item.product.price)}
            </span>
          </div>
          
          <div className="flex items-center mt-2">
            <div className="flex items-center border border-gray-200 rounded">
              <Button 
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none"
                onClick={() => changeQuantity(quantity - 1)}
                disabled={quantity <= 1 || updateCartMutation.isPending}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-10 text-center text-sm">
                {updateCartMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mx-auto animate-spin" />
                ) : (
                  quantity
                )}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none"
                onClick={() => changeQuantity(quantity + 1)}
                disabled={quantity >= item.product.stockQuantity || updateCartMutation.isPending}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="ml-4 text-gray-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleRemove}
              disabled={removeCartMutation.isPending}
            >
              {removeCartMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              <span className="ml-1 hidden sm:inline">Remove</span>
            </Button>
          </div>
        </div>
        
        <div className="text-right">
          <span className="font-semibold text-gray-800">
            {formatPrice(item.product.price * quantity)}
          </span>
          
          {item.product.stockQuantity < 10 && (
            <p className="text-xs text-amber-600 mt-1">
              Only {item.product.stockQuantity} left
            </p>
          )}
        </div>
      </div>
      
      <Separator className="mt-4" />
    </div>
  );
}
