import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Loader2, User as UserIcon, Box, CreditCard, LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Parse URL for specific order to show
  const params = new URLSearchParams(location.split("?")[1] || "");
  const orderIdParam = params.get("order");
  
  useEffect(() => {
    if (orderIdParam) {
      setActiveTab("orders");
    }
  }, [orderIdParam]);
  
  // Fetch user orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Format price from cents to dollars
  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <UserIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Not Authenticated</h2>
          <p className="text-gray-600 mb-6">
            Please sign in to view your profile.
          </p>
          <Button asChild className="bg-primary hover:bg-primary-dark">
            <a href="/auth">Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Account</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar for larger screens */}
        <div className="hidden lg:block">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center mb-6">
                <Avatar className="h-20 w-20 mb-3">
                  <AvatarImage src={user.avatar || ""} alt={user.fullName} />
                  <AvatarFallback className="text-lg">{user.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{user.fullName}</h2>
                <p className="text-gray-600 text-sm">{user.email}</p>
                <Badge className="mt-2 capitalize">{user.role}</Badge>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-1">
                <Button 
                  variant={activeTab === "profile" ? "default" : "ghost"} 
                  className={`w-full justify-start ${activeTab === "profile" ? "bg-primary text-white" : ""}`}
                  onClick={() => setActiveTab("profile")}
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  Profile
                </Button>
                <Button 
                  variant={activeTab === "orders" ? "default" : "ghost"} 
                  className={`w-full justify-start ${activeTab === "orders" ? "bg-primary text-white" : ""}`}
                  onClick={() => setActiveTab("orders")}
                >
                  <Box className="mr-2 h-4 w-4" />
                  Orders
                </Button>
                {user.role === "supplier" && (
                  <Button 
                    variant={activeTab === "products" ? "default" : "ghost"} 
                    className={`w-full justify-start ${activeTab === "products" ? "bg-primary text-white" : ""}`}
                    onClick={() => setActiveTab("products")}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    My Products
                  </Button>
                )}
              </div>
              
              <Separator className="my-4" />
              
              <Button 
                variant="ghost" 
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="mr-2 h-4 w-4" />
                )}
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Mobile tabs */}
        <div className="lg:hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              {user.role === "supplier" && (
                <TabsTrigger value="products">Products</TabsTrigger>
              )}
            </TabsList>
          </Tabs>
        </div>
        
        {/* Main content */}
        <div className="lg:col-span-3">
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Manage your personal details and account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Full Name</h3>
                    <p className="text-gray-900">{user.fullName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Email</h3>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Username</h3>
                    <p className="text-gray-900">{user.username}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Account Type</h3>
                    <p className="text-gray-900 capitalize">{user.role}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Member Since</h3>
                    <p className="text-gray-900">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-end">
                  <Button className="bg-primary hover:bg-primary-dark">
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {activeTab === "orders" && (
            <Card>
              <CardHeader>
                <CardTitle>Your Orders</CardTitle>
                <CardDescription>View and track your order history</CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : !orders || orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Box className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No orders found</h3>
                    <p className="text-gray-600 mb-6">
                      You haven't placed any orders yet.
                    </p>
                    <Button asChild className="bg-primary hover:bg-primary-dark">
                      <a href="/products">Browse Products</a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div 
                        key={order.id} 
                        className={`border rounded-md p-4 ${
                          orderIdParam && parseInt(orderIdParam) === order.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row justify-between mb-4">
                          <div>
                            <h3 className="font-medium">Order #{order.id}</h3>
                            <p className="text-sm text-gray-600">Placed on {formatDate(order.createdAt)}</p>
                          </div>
                          <div className="mt-2 md:mt-0">
                            <Badge className={getStatusBadgeColor(order.status)}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                <img 
                                  src={item.product.imageUrl} 
                                  alt={item.product.name} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{item.product.name}</p>
                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{formatPrice(item.unitPrice * item.quantity)}</p>
                                <p className="text-sm text-gray-500">{formatPrice(item.unitPrice)} each</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t flex justify-between items-center">
                          <p className="font-medium">Total: {formatPrice(order.totalAmount)}</p>
                          <Button variant="outline" size="sm">View Details</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {activeTab === "products" && user.role === "supplier" && (
            <Card>
              <CardHeader>
                <CardTitle>My Products</CardTitle>
                <CardDescription>Manage your product listings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Supplier Dashboard</h3>
                  <p className="text-gray-600 mb-6">
                    This is where you can manage your product listings.
                  </p>
                  <Button className="bg-primary hover:bg-primary-dark">
                    Add New Product
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
