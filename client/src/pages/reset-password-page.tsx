import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Link, useLocation, useSearch } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Validation schema
const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [resetSuccess, setResetSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [, setLocation] = useLocation();
  const query = useSearch();
  const { resetPasswordMutation } = useAuth();
  const { toast } = useToast();
  
  // Extract token from URL
  useEffect(() => {
    const params = new URLSearchParams(query);
    const tokenFromQuery = params.get('token');
    
    if (tokenFromQuery) {
      setToken(tokenFromQuery);
      setTokenValid(true); // Assume token is valid initially
    } else {
      setTokenValid(false);
      toast({
        title: "Invalid request",
        description: "Reset token is missing or invalid.",
        variant: "destructive",
      });
    }
  }, [query, toast]);
  
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });
  
  const onSubmit = async (data: ResetPasswordValues) => {
    if (!token) return;
    
    try {
      await resetPasswordMutation.mutateAsync({
        token,
        ...data
      });
      
      setResetSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        setLocation('/auth');
      }, 3000);
    } catch (error) {
      console.error('Error resetting password:', error);
      setTokenValid(false);
    }
  };
  
  // Show loading state
  if (tokenValid === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Show error if token is invalid
  if (tokenValid === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          <Card className="border-red-200">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-red-100 text-red-600 rounded-full">
                  <AlertTriangle className="h-6 w-6" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl">Invalid Reset Link</CardTitle>
              <CardDescription className="text-center">
                This password reset link is invalid or has expired.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/forgot-password">
                <Button variant="outline" className="mt-2 mr-2">Request New Link</Button>
              </Link>
              <Link href="/auth">
                <Button className="mt-2">Back to Login</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md">
        <Link href="/auth" className="inline-flex items-center text-sm text-gray-600 hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Login
        </Link>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Reset Your Password</CardTitle>
            <CardDescription>
              Create a new password for your account.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {resetSuccess ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 text-green-800 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-medium">Password Updated</h3>
                <p className="text-gray-600">
                  Your password has been successfully reset.
                  <br />
                  You will be redirected to the login page shortly.
                </p>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={resetPasswordMutation.isPending}
                  >
                    {resetPasswordMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
          
          {!resetSuccess && (
            <CardFooter className="flex justify-center">
              <div className="text-sm text-center text-gray-600">
                Remember your password?{' '}
                <Link href="/auth" className="text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}