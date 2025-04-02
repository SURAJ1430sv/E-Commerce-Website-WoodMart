import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation, useParams, Link } from 'wouter';
import { Loader2, ArrowLeft, Star, ShoppingCart } from 'lucide-react';
import { Product } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [quantity, setQuantity] = useState(1);

  // Fetch product detail
  const { data: product, isLoading, isError } = useQuery<Product>({
    queryKey: [`/api/products/${id}`],
  });

  // Get category of the product
  const { data: categories } = useQuery<any[]>({
    queryKey: ['/api/categories'],
  });

  const category = categories?.find(c => c.id === product?.categoryId);

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
        description: `${product?.name} has been added to your cart`,
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

  // Handle quantity change
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (product && quantity < product.stockQuantity) {
      setQuantity(quantity + 1);
    } else {
      toast({
        title: 'Maximum stock reached',
        description: 'You have reached the maximum available stock for this product',
        variant: 'destructive',
      });
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to add items to your cart',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    if (product) {
      addToCartMutation.mutate({
        productId: product.id,
        quantity,
      });
    }
  };

  // Format price from cents to dollars
  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Product not found</h2>
        <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Link href="/products">
          <Button className="bg-primary hover:bg-primary-dark">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/products">
          <Button variant="ghost" className="mb-4 text-gray-600 hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Product Image */}
        <div className="bg-white rounded-lg overflow-hidden shadow-md">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
          
          <div className="flex items-center mb-4">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5" fill={i < 4 ? 'currentColor' : 'none'} />
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-2">(24 reviews)</span>
            {category && (
              <span className="ml-4 bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {category.name}
              </span>
            )}
          </div>

          <div className="text-2xl font-bold text-primary-dark mb-6">
            {formatPrice(product.price)}
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
            <p className="text-gray-600">{product.description}</p>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800">Quantity</h3>
              <span className={`text-sm ${product.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stockQuantity > 0 ? `In Stock (${product.stockQuantity} available)` : 'Out of Stock'}
              </span>
            </div>
            
            <div className="flex items-center mb-6">
              <Button 
                variant="outline" 
                size="icon"
                onClick={decreaseQuantity}
                disabled={quantity <= 1 || product.stockQuantity <= 0}
                className="rounded-r-none"
              >
                -
              </Button>
              <div className="px-4 py-2 border-t border-b border-gray-200 w-16 text-center">
                {quantity}
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={increaseQuantity}
                disabled={quantity >= product.stockQuantity || product.stockQuantity <= 0}
                className="rounded-l-none"
              >
                +
              </Button>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <Button 
              className="flex-1 bg-primary hover:bg-primary-dark flex items-center justify-center gap-2"
              onClick={handleAddToCart}
              disabled={product.stockQuantity <= 0 || addToCartMutation.isPending}
            >
              {addToCartMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShoppingCart className="h-4 w-4" />
              )}
              {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
            </Button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 17h4V5H2v12h8zm-7-7h8"></path>
                <path d="M20 8h2v9H10v-1.5"></path>
                <path d="M14 13H9"></path>
                <path d="M5 13H2"></path>
              </svg>
              <span className="font-medium">Free shipping</span>
            </div>
            <p className="text-sm text-gray-600">Orders over $300 qualify for free shipping</p>
          </div>
        </div>
      </div>

      {/* Product details tabs */}
      <Card className="mb-12">
        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <CardContent className="pt-6">
            <TabsContent value="details">
              <div className="space-y-4">
                <p className="text-gray-600">
                  {product.description}
                </p>
                <p className="text-gray-600">
                  Our premium plywood is sourced from sustainable forests and manufactured to the highest quality standards. 
                  Perfect for a wide range of applications including furniture making, cabinetry, construction, and more.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="specifications">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Product Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Thickness</span>
                        <span className="font-medium">18mm</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Material</span>
                        <span className="font-medium">Birch</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Dimensions</span>
                        <span className="font-medium">4ft x 8ft</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Grade</span>
                        <span className="font-medium">A/BB</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Water Resistant</span>
                        <span className="font-medium">Yes</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Certification</span>
                        <span className="font-medium">FSC Certified</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Customer Reviews</h3>
                  <Button variant="outline">Write a Review</Button>
                </div>
                
                <div className="space-y-4">
                  {/* Sample review for visual design, would be replaced with actual reviews */}
                  <div className="border-b pb-4">
                    <div className="flex items-center mb-2">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4" fill="currentColor" />
                        ))}
                      </div>
                      <span className="ml-2 text-sm font-medium">Great quality product</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">
                      I purchased this plywood for a custom cabinet project and was very impressed with the quality. 
                      The sheets were perfectly flat with no voids, and the finish was smooth and consistent.
                    </p>
                    <div className="flex items-center text-gray-500 text-xs">
                      <span className="font-medium">Robert Johnson</span>
                      <Separator orientation="vertical" className="mx-2 h-3" />
                      <span>2 months ago</span>
                    </div>
                  </div>
                  
                  <div className="border-b pb-4">
                    <div className="flex items-center mb-2">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4" fill={i < 4 ? 'currentColor' : 'none'} />
                        ))}
                      </div>
                      <span className="ml-2 text-sm font-medium">Good value</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">
                      Good quality plywood at a competitive price. Fast shipping too. Would buy again.
                    </p>
                    <div className="flex items-center text-gray-500 text-xs">
                      <span className="font-medium">Sarah Miller</span>
                      <Separator orientation="vertical" className="mx-2 h-3" />
                      <span>1 month ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Related products section would go here */}
    </div>
  );
}
