import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [resetTokenSent, setResetTokenSent] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const { forgotPasswordMutation } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });
  
  const onSubmit = async (data: ForgotPasswordValues) => {
    try {
      const response = await forgotPasswordMutation.mutateAsync(data);
      setResetTokenSent(true);
      
      // In development/testing mode only, we get back the token
      if (response.resetToken) {
        setResetToken(response.resetToken);
      }
    } catch (error) {
      console.error('Error requesting password reset:', error);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md">
        <Link href="/auth" className="inline-flex items-center text-sm text-gray-600 hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Login
        </Link>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {resetTokenSent ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 text-green-800 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-medium">Check your email</h3>
                <p className="text-gray-600">
                  We've sent password reset instructions to your email address.
                </p>
                
                {/* Development/testing only - shows the reset token */}
                {resetToken && (
                  <div className="mt-4 p-3 bg-gray-100 rounded-md text-left">
                    <p className="text-xs text-gray-500 mb-1">Developer Mode: Reset Token</p>
                    <code className="text-xs break-all">{resetToken}</code>
                    <p className="text-xs mt-2">
                      <Link href={`/reset-password?token=${resetToken}`} className="text-primary hover:underline">
                        Click here to reset your password
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your.email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={forgotPasswordMutation.isPending}
                  >
                    {forgotPasswordMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Instructions'
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <div className="text-sm text-center text-gray-600">
              Remember your password?{' '}
              <Link href="/auth" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}