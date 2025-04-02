import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Warehouse, Shield, Truck, Users, BarChart, Award, Leaf } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-6 md:py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">About WoodMarket</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          The leading marketplace for premium plywood and wood products,
          connecting suppliers and customers since 2018.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        <div>
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-gray-600 mb-6">
            At WoodMarket, we're on a mission to transform the plywood industry by creating a transparent, 
            efficient marketplace that connects quality suppliers with discerning buyers. 
            We believe in sustainable forestry practices and ensuring that all stakeholders in the 
            supply chain receive fair value for their products and services.
          </p>
          <p className="text-gray-600">
            Our platform simplifies the procurement process, reduces waste, and promotes environmentally 
            responsible choices in the wood products industry. By leveraging technology, we're making 
            it easier than ever to source high-quality materials for construction, manufacturing, 
            and design projects of all sizes.
          </p>
        </div>
        <div className="relative h-64 md:h-full rounded-lg overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
            alt="Wood workshop" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Why Choose WoodMarket</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader className="pb-2">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Shield className="text-primary h-6 w-6" />
              </div>
              <CardTitle>Quality Assurance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                All suppliers are vetted to ensure they meet our strict quality standards.
                We regularly audit our suppliers to maintain consistent product quality.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Truck className="text-primary h-6 w-6" />
              </div>
              <CardTitle>Efficient Logistics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Our integrated logistics network ensures timely delivery, reducing delays
                and keeping your projects on schedule.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Leaf className="text-primary h-6 w-6" />
              </div>
              <CardTitle>Sustainability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We prioritize suppliers who follow sustainable forestry practices and offer
                eco-friendly products with proper certifications.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              name: "Sarah Johnson",
              title: "Founder & CEO",
              image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
            },
            {
              name: "Michael Chen",
              title: "COO",
              image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
            },
            {
              name: "Elena Rodriguez",
              title: "Head of Supplier Relations",
              image: "https://images.unsplash.com/photo-1598550880863-4e8aa3d0edb4?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
            },
            {
              name: "David Wilson",
              title: "Lead Developer",
              image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
            }
          ].map((member, index) => (
            <div key={index} className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <h3 className="font-semibold text-lg">{member.name}</h3>
              <p className="text-gray-600">{member.title}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-100 py-12 px-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-8 text-center">Our Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-primary text-4xl font-bold mb-2">500+</div>
            <p className="text-gray-600">Trusted Suppliers</p>
          </div>
          <div className="text-center">
            <div className="text-primary text-4xl font-bold mb-2">10,000+</div>
            <p className="text-gray-600">Happy Customers</p>
          </div>
          <div className="text-center">
            <div className="text-primary text-4xl font-bold mb-2">30M+</div>
            <p className="text-gray-600">Board Feet Delivered</p>
          </div>
        </div>
      </div>
    </main>
  );
}