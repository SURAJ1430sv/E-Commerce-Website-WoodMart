import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";
import { Category, Product } from "@shared/schema";
import HeroBanner from "@/components/ui/hero-banner";
import CategoryCard from "@/components/category/category-card";
import ProductCard from "@/components/product/product-card";
import SupplierCard from "@/components/supplier/supplier-card";
import TestimonialCard from "@/components/ui/testimonial-card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

// Mocked data for suppliers and testimonials since they're not in the DB yet
const topSuppliers = [
  {
    id: 1,
    name: "TimberCraft Industries",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&h=50&q=80",
    rating: 4.8,
    description: "Specializing in high-quality marine and structural plywood for over 25 years.",
    tags: ["Marine", "Structural", "FSC Certified"]
  },
  {
    id: 2,
    name: "EcoWood Solutions",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&h=50&q=80",
    rating: 4.1,
    description: "Eco-friendly plywood products sourced from sustainable forests. Green building certified.",
    tags: ["Eco-friendly", "Sustainable", "LEED Certified"]
  },
  {
    id: 3,
    name: "Premium Wood Products",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&h=50&q=80",
    rating: 4.9,
    description: "Luxury decorative plywood and veneers for high-end furniture and interior design.",
    tags: ["Decorative", "Luxury", "Custom"]
  }
];

const testimonials = [
  {
    id: 1,
    rating: 5,
    text: "The marine plywood I purchased was exactly what I needed for my boat restoration project. Excellent quality and arrived earlier than expected.",
    author: "Robert Johnson",
    title: "Boat Builder",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&h=50&q=80"
  },
  {
    id: 2,
    rating: 4.5,
    text: "As a furniture maker, I rely on consistent quality. The birch plywood from WoodMarket has been consistently excellent for all my custom cabinet projects.",
    author: "Sarah Miller",
    title: "Furniture Designer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&h=50&q=80"
  },
  {
    id: 3,
    rating: 5,
    text: "Our construction company has been sourcing all our plywood from WoodMarket for the past two years. Great selection, competitive prices, and reliable delivery.",
    author: "Michael Torres",
    title: "Construction Manager",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&h=50&q=80"
  }
];

export default function HomePage() {
  const { user } = useAuth();
  
  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Fetch featured products
  const { data: featuredProducts, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", { featured: true }],
  });
  
  const isLoading = categoriesLoading || productsLoading;
  
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Banner */}
      <HeroBanner 
        title="Premium Plywood for Every Project"
        description="Connect with trusted suppliers and find the perfect materials for your construction and woodworking needs."
        buttonText="Browse Products"
        buttonLink="/products"
        imageSrc="https://images.unsplash.com/photo-1603849625744-9d1ed4ce077b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=400&q=80"
      />
      
      {/* Quick Access Categories */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Shop By Category</h2>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories?.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
      
      {/* Featured Products */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Featured Products</h2>
          <Link href="/products" className="text-secondary hover:text-secondary-dark font-medium">
            View All
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {featuredProducts && featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No featured products available</p>
                <p className="text-sm">Featured products will appear here once suppliers mark their products as featured.</p>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Top Suppliers */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Top Suppliers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topSuppliers.map((supplier) => (
            <SupplierCard key={supplier.id} supplier={supplier} />
          ))}
        </div>
      </div>
      
      {/* Why Choose Us */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Why Choose WoodMarket</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary-light/10 rounded-full p-4 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.21 13.89L7 23l2.5-1.5L12 23l2.5-1.5L17 23l-1.21-9.11"></path>
                <path d="M11 10h1v3h-1z"></path>
                <path d="M4.5 4.5l7.5 7.5"></path>
                <path d="M19.5 4.5l-7.5 7.5"></path>
                <path d="M16.5 2.5l.5 3L20 7l-3 .5-1.5 2.5L14 7 11 6.5l2.5-2"></path>
                <path d="M6 12.5L4 10l-.5-3L7 7l2-1 .5 3-1.5 2.5h-2z"></path>
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Quality Guaranteed</h3>
            <p className="text-gray-600 text-sm">All products meet strict quality control standards</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary-light/10 rounded-full p-4 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 17h4V5H2v12h8zm-7-7h8"></path>
                <path d="M20 8h2v9H10v-1.5"></path>
                <path d="M14 13H9"></path>
                <path d="M5 13H2"></path>
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Fast Delivery</h3>
            <p className="text-gray-600 text-sm">Quick shipping options available nationwide</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary-light/10 rounded-full p-4 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 11l-6 6-3-3"></path>
                <path d="M11 4L4 4L4 22L22 22L22 13"></path>
                <path d="M15 5l2 2 4-4"></path>
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Competitive Pricing</h3>
            <p className="text-gray-600 text-sm">Direct from suppliers at wholesale rates</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary-light/10 rounded-full p-4 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 22a5 5 0 0 1-5-5"></path>
                <path d="M7 12.5V17l5-4 5 4v-4.5"></path>
                <path d="M21.3 8.7c.4-.5.7-1.1.7-1.7a2 2 0 0 0-4 0 2 2 0 0 1-2 2h-5"></path>
                <path d="M11 4a2 2 0 0 1 0 4h-2"></path>
                <path d="M7 11a5 5 0 0 1-5-5"></path>
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Expert Support</h3>
            <p className="text-gray-600 text-sm">Professional advice on all your wood needs</p>
          </div>
        </div>
      </div>
      
      {/* Customer Testimonials */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-primary rounded-xl overflow-hidden mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <h2 className="text-white text-3xl font-bold mb-4">Ready to find the perfect plywood for your project?</h2>
            <p className="text-white/80 text-lg mb-6">Join thousands of satisfied customers who trust WoodMarket for their plywood needs.</p>
            <div className="flex flex-wrap gap-4">
              {!user ? (
                <>
                  <Link href="/auth">
                    <Button className="px-6 py-3 h-auto bg-white text-primary font-medium hover:bg-gray-100">
                      Sign Up Now
                    </Button>
                  </Link>
                  <Link href="/products">
                    <Button className="px-6 py-3 h-auto bg-transparent text-white border border-white font-medium hover:bg-white/10">
                      Learn More
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href="/products">
                  <Button className="px-6 py-3 h-auto bg-white text-primary font-medium hover:bg-gray-100">
                    Browse Products
                  </Button>
                </Link>
              )}
            </div>
          </div>
          <div className="hidden lg:block relative">
            <img 
              src="https://images.unsplash.com/photo-1601058268499-e52e4e80eae6?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=500&q=80" 
              className="w-full h-full object-cover" 
              alt="Woodworking shop" 
            />
          </div>
        </div>
      </div>
    </main>
  );
}
