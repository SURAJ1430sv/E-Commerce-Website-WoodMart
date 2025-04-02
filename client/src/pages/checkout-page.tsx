import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { ShoppingBag, CreditCard, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

// Initialize Stripe with your publishable key
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing Stripe publishable key. Please add VITE_STRIPE_PUBLIC_KEY to your environment variables.');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Payment form component that handles the actual payment
function CheckoutForm({ totalAmount }: { totalAmount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const { clearCart } = useCart();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin, // Redirect on completion - not using this as we handle it client-side
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: 'Payment Failed',
          description: error.message || 'Something went wrong with your payment',
          variant: 'destructive',
        });
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast({
          title: 'Payment Successful',
          description: 'Thank you for your purchase!',
        });
        
        // Create order after successful payment
        await apiRequest('POST', '/api/orders', { totalAmount });
        
        // Clear cart after successful order creation
        await clearCart();
        
        setIsPaymentComplete(true);
        setTimeout(() => {
          setLocation('/');
        }, 3000);
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast({
        title: 'Payment Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isPaymentComplete) {
    return (
      <div className="text-center py-10">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Payment Successful</h2>
        <p className="text-gray-600 mb-6">Thank you for your purchase!</p>
        <p className="text-sm text-gray-500">Redirecting you to the home page...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      <Button
        type="submit"
        className="w-full"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Pay ${(totalAmount / 100).toFixed(2)}
          </>
        )}
      </Button>
    </form>
  );
}

export default function CheckoutPage() {
  const { cartItems, cartTotals } = useCart();
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Redirect to cart if cart is empty
    if (!cartItems || cartItems.length === 0) {
      setLocation('/cart');
      return;
    }

    // Redirect to login if user is not authenticated
    if (!user) {
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to checkout',
        variant: 'destructive',
      });
      setLocation('/auth');
      return;
    }

    // Create payment intent
    const createPaymentIntent = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest('POST', '/api/create-payment-intent', {
          amount: cartTotals.subtotal
        });
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        toast({
          title: 'Error',
          description: 'Failed to initialize payment. Please try again.',
          variant: 'destructive',
        });
        setLocation('/cart');
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [cartItems, user, setLocation, toast, cartTotals]);

  const formatPrice = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/cart" className="inline-flex items-center text-sm text-gray-600 hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Cart
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cart Summary */}
        <div className="md:col-span-1 bg-gray-50 p-6 rounded-lg h-fit">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <ShoppingBag className="h-5 w-5 mr-2" />
            Order Summary
          </h2>
          
          <div className="space-y-4 mb-6">
            {cartItems && cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-gray-200 rounded overflow-hidden mr-3">
                    <img 
                      src={item.product.imageUrl} 
                      alt={item.product.name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.product.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-medium">
                  {formatPrice(item.product.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatPrice(cartTotals.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span>{cartTotals.shipping > 0 ? formatPrice(cartTotals.shipping) : 'Free'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span>{formatPrice(cartTotals.tax)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatPrice(cartTotals.total)}</span>
            </div>
          </div>
        </div>
        
        {/* Payment Section */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-bold mb-6">Payment Information</h2>
          
          {clientSecret && (
            <Elements 
              stripe={stripePromise} 
              options={{ 
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#0055FF',
                  }
                }
              }}
            >
              <CheckoutForm totalAmount={cartTotals.total} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
}