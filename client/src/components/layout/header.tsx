import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShoppingCart, User, LogOut, Warehouse, Search, Menu, X } from "lucide-react";
import CurrencySelector from "@/components/currency/currency-selector";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const { cartItems } = useCart();
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartItemCount = cartItems?.length || 0;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Warehouse className="text-primary h-6 w-6 mr-2" />
              <span className="text-primary font-bold text-xl">WoodMarket</span>
            </Link>
            <div className="hidden md:flex space-x-8 ml-10">
              <Link href="/" className={`font-medium ${location === '/' ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}>
                Home
              </Link>
              <Link href="/products" className={`font-medium ${location === '/products' ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}>
                Products
              </Link>
              <Link href="/suppliers" className={`font-medium ${location === '/suppliers' ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}>
                Suppliers
              </Link>
              <Link href="/about" className={`font-medium ${location === '/about' ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}>
                About
              </Link>
              <Link href="/contact" className={`font-medium ${location === '/contact' ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}>
                Contact
              </Link>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="hidden md:block mr-4">
              <CurrencySelector />
            </div>
            <form 
              onSubmit={handleSearchSubmit}
              className="hidden md:flex items-center border-2 border-gray-200 rounded-lg overflow-hidden w-64"
            >
              <Input
                type="text"
                placeholder="Search products..."
                className="px-4 py-2 flex-grow border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" variant="default" className="bg-primary text-white rounded-none">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            
            {/* User not logged in */}
            {!user && (
              <div className="hidden md:block ml-4">
                <Link href="/auth">
                  <Button variant="outline" className="mr-2 text-primary border-primary hover:bg-primary/5 hover:text-primary-dark">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button className="bg-primary text-white hover:bg-primary-dark">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
            
            {/* User logged in */}
            {user && (
              <div className="flex items-center ml-4">
                <Link href="/cart" className="text-gray-600 hover:text-primary relative mr-4">
                  <ShoppingCart className="h-6 w-6" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center max-w-xs text-sm focus:outline-none">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar || ""} alt={user.fullName} />
                        <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="ml-2 hidden md:block">{user.fullName}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center w-full">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            
            {/* Mobile menu button */}
            <button 
              className="ml-4 md:hidden text-gray-600"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile search and currency (shown on small screens) */}
      <div className="md:hidden px-4 py-3 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-600">Currency:</span>
          <CurrencySelector />
        </div>
        <form 
          onSubmit={handleSearchSubmit}
          className="flex border-2 border-gray-200 rounded-lg overflow-hidden"
        >
          <Input
            type="text"
            placeholder="Search products..."
            className="px-4 py-2 flex-grow border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit" variant="default" className="bg-primary text-white rounded-none">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white">
          <div className="px-4 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              href="/" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location === '/' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={closeMobileMenu}
            >
              Home
            </Link>
            <Link 
              href="/products" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location === '/products' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={closeMobileMenu}
            >
              Products
            </Link>
            <Link 
              href="/suppliers" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location === '/suppliers' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={closeMobileMenu}
            >
              Suppliers
            </Link>
            <Link 
              href="/about" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location === '/about' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={closeMobileMenu}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location === '/contact' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={closeMobileMenu}
            >
              Contact
            </Link>
            
            {!user && (
              <div className="pt-2 pb-3 border-t border-gray-200">
                <Link 
                  href="/auth"
                  className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-gray-100"
                  onClick={closeMobileMenu}
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-primary text-white mt-2"
                  onClick={closeMobileMenu}
                >
                  Sign Up
                </Link>
              </div>
            )}
            
            {user && (
              <div className="pt-2 pb-3 border-t border-gray-200">
                <Link 
                  href="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100"
                  onClick={closeMobileMenu}
                >
                  Profile
                </Link>
                <Link 
                  href="/cart"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100"
                  onClick={closeMobileMenu}
                >
                  Cart {cartItemCount > 0 && `(${cartItemCount})`}
                </Link>
                <button 
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-100"
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
