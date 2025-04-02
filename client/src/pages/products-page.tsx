import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Product, Category } from "@shared/schema";
import ProductGrid from "@/components/product/product-grid";
import { Loader2, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export default function ProductsPage() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get("category") || "");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [inStock, setInStock] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  // Create URL query params based on filters
  const updateQueryParams = () => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCategory) params.set("category", selectedCategory);
    
    const queryString = params.toString();
    setLocation(queryString ? `/products?${queryString}` : "/products", { replace: true });
  };
  
  // Update URL when filters change
  useEffect(() => {
    updateQueryParams();
  }, [selectedCategory]);
  
  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQueryParams();
  };
  
  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Fetch products based on filters
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: [
      "/api/products",
      searchQuery ? `/api/products/search/${searchQuery}` : null,
      selectedCategory ? `/api/products?categoryId=${selectedCategory}` : null,
    ].filter(Boolean),
  });
  
  const isLoading = categoriesLoading || productsLoading;
  
  // Filter and sort products
  const filteredProducts = products ? [...products].filter(product => {
    if (inStock && product.stockQuantity <= 0) return false;
    if (product.price < priceRange[0] * 100 || product.price > priceRange[1] * 100) return false;
    return true;
  }) : [];
  
  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low-high":
        return a.price - b.price;
      case "price-high-low":
        return b.price - a.price;
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return b.isFeatured ? 1 : -1;
    }
  });
  
  // Apply search filter if a query exists
  const searchedProducts = sortedProducts.filter(product => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    );
  });
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Products</h1>
        <p className="text-gray-600">Browse our collection of high-quality plywood products</p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Desktop Filters */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Filters</CardTitle>
              <CardDescription>Refine your product search</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Accordion type="single" collapsible defaultValue="category">
                <AccordionItem value="category">
                  <AccordionTrigger>Categories</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center">
                        <Checkbox 
                          id="all-categories"
                          checked={selectedCategory === ""}
                          onCheckedChange={() => setSelectedCategory("")}
                        />
                        <Label htmlFor="all-categories" className="ml-2 text-sm font-normal">
                          All Categories
                        </Label>
                      </div>
                      
                      {categories?.map((category) => (
                        <div key={category.id} className="flex items-center">
                          <Checkbox 
                            id={`category-${category.id}`}
                            checked={selectedCategory === category.id.toString()}
                            onCheckedChange={() => setSelectedCategory(category.id.toString())}
                          />
                          <Label htmlFor={`category-${category.id}`} className="ml-2 text-sm font-normal">
                            {category.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="price">
                  <AccordionTrigger>Price Range</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <Slider
                        value={priceRange}
                        min={0}
                        max={1000}
                        step={10}
                        onValueChange={setPriceRange}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-sm">${priceRange[0]}</span>
                        <span className="text-sm">${priceRange[1]}</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="availability">
                  <AccordionTrigger>Availability</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex items-center">
                      <Checkbox 
                        id="in-stock"
                        checked={inStock}
                        onCheckedChange={() => setInStock(!inStock)}
                      />
                      <Label htmlFor="in-stock" className="ml-2 text-sm font-normal">
                        In Stock Only
                      </Label>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => {
                  setSelectedCategory("");
                  setPriceRange([0, 1000]);
                  setInStock(false);
                  setSearchQuery("");
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex-1">
          {/* Search and sort toolbar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary">
                  <Search className="h-5 w-5" />
                </button>
              </div>
              <Button type="submit" className="bg-primary hover:bg-primary-dark">
                Search
              </Button>
            </form>
            
            {/* Mobile filter button */}
            <Drawer open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
              <DrawerTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                  <Filter className="h-4 w-4" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Filters</DrawerTitle>
                </DrawerHeader>
                <div className="px-4 py-2">
                  <h3 className="font-medium mb-2">Categories</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center">
                      <Checkbox 
                        id="all-categories-mobile"
                        checked={selectedCategory === ""}
                        onCheckedChange={() => setSelectedCategory("")}
                      />
                      <Label htmlFor="all-categories-mobile" className="ml-2">
                        All Categories
                      </Label>
                    </div>
                    
                    {categories?.map((category) => (
                      <div key={category.id} className="flex items-center">
                        <Checkbox 
                          id={`category-mobile-${category.id}`}
                          checked={selectedCategory === category.id.toString()}
                          onCheckedChange={() => setSelectedCategory(category.id.toString())}
                        />
                        <Label htmlFor={`category-mobile-${category.id}`} className="ml-2">
                          {category.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                  
                  <h3 className="font-medium mb-2">Price Range</h3>
                  <div className="space-y-4 mb-4">
                    <Slider
                      value={priceRange}
                      min={0}
                      max={1000}
                      step={10}
                      onValueChange={setPriceRange}
                    />
                    <div className="flex items-center justify-between">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-medium mb-2">Availability</h3>
                  <div className="flex items-center">
                    <Checkbox 
                      id="in-stock-mobile"
                      checked={inStock}
                      onCheckedChange={() => setInStock(!inStock)}
                    />
                    <Label htmlFor="in-stock-mobile" className="ml-2">
                      In Stock Only
                    </Label>
                  </div>
                </div>
                <DrawerFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedCategory("");
                      setPriceRange([0, 1000]);
                      setInStock(false);
                    }}
                  >
                    Clear Filters
                  </Button>
                  <DrawerClose asChild>
                    <Button>Apply Filters</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
            
            {/* Sort dropdown */}
            <div className="w-full md:w-48">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low-high">Price: Low to High</SelectItem>
                  <SelectItem value="price-high-low">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Products */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : searchedProducts.length > 0 ? (
            <ProductGrid products={searchedProducts} />
          ) : (
            <div className="text-center py-12">
              <div className="mb-4">
                <Search className="h-12 w-12 mx-auto text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or filter criteria
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory("");
                  setPriceRange([0, 1000]);
                  setInStock(false);
                  setSearchQuery("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
