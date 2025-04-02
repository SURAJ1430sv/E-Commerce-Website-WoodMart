import { useState } from 'react';
import { Link } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { Star, ShoppingCart, Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Product } from '@shared/schema';
import Price from '@/components/currency/price';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (data: { productId: number; quantity: number }) => {
      const res = await apiRequest('POST', `/api/cart`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: 'Added to cart',
        description: `${product.name} has been added to your cart`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to add to cart',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to product detail
    e.stopPropagation();

    if (!user) {
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to add items to your cart',
        variant: 'destructive',
      });
      return;
    }

    addToCartMutation.mutate({
      productId: product.id,
      quantity: 1,
    });
  };

  // Convert price from cents to dollars
  const priceInDollars = product.price / 100;

  return (
    <div 
      className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md h-full product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative">
          <img 
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-48 object-cover transition-transform duration-300"
            style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
          />
          {product.isFeatured && (
            <span className="absolute top-2 right-2 bg-amber-400 text-white text-xs font-bold px-2 py-1 rounded">
              Featured
            </span>
          )}
          {product.stockQuantity <= 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
              <span className="bg-red-600 text-white px-3 py-1 rounded-md font-medium">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/products/${product.id}`} className="block">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg mb-1 text-gray-800 line-clamp-1">{product.name}</h3>
            <span className="text-primary-dark font-bold">
              <Price amount={priceInDollars} />
            </span>
          </div>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

          <div className="flex items-center mb-3">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4" fill={i < 4 ? 'currentColor' : 'none'} />
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">(24 reviews)</span>
          </div>
        </Link>

        <div className="flex space-x-2">
          <Button 
            className="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
            onClick={handleAddToCart}
            disabled={product.stockQuantity <= 0 || addToCartMutation.isPending}
          >
            {addToCartMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <ShoppingCart className="h-4 w-4 mr-1" />
            )}
            {product.stockQuantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
          <Button 
            variant="outline"
            className="w-10 h-10 bg-gray-100 text-gray-600 rounded-md flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
