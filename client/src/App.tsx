import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProductsPage from "@/pages/products-page";
import ProductDetailPage from "@/pages/product-detail-page";
import CartPage from "@/pages/cart-page";
import ProfilePage from "@/pages/profile-page";
import SuppliersPage from "@/pages/suppliers-page";
import AboutPage from "@/pages/about-page";
import ContactPage from "@/pages/contact-page";
import ForgotPasswordPage from "@/pages/forgot-password-page";
import ResetPasswordPage from "@/pages/reset-password-page";
import { ProtectedRoute } from "./lib/protected-route";
import Header from "./components/layout/header";
import Footer from "./components/layout/footer";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/products" component={ProductsPage} />
          <Route path="/products/:id" component={ProductDetailPage} />
          <Route path="/suppliers" component={SuppliersPage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/contact" component={ContactPage} />
          <Route path="/forgot-password" component={ForgotPasswordPage} />
          <Route path="/reset-password" component={ResetPasswordPage} />
          <ProtectedRoute path="/cart" component={CartPage} />
          <ProtectedRoute path="/profile" component={ProfilePage} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
