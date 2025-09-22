import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import SupplierCard from "@/components/supplier/supplier-card";

export default function SuppliersPage() {
  const { toast } = useToast();
  
  // Sample suppliers data until we have a real supplier API
  const sampleSuppliers = [
    {
      id: 1,
      name: "Premium Woods Inc.",
      avatar: "https://images.unsplash.com/photo-1560343776-97e7d202ff0e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      rating: 4.8,
      description: "Specializing in Marine and Furniture grade plywood with over 25 years of industry experience.",
      tags: ["Marine", "Furniture", "Certified"]
    },
    {
      id: 2,
      name: "EcoTimber Solutions",
      avatar: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      rating: 4.6,
      description: "Sustainable plywood and timber products, all sourced from responsibly managed forests.",
      tags: ["Eco-friendly", "Sustainable", "FSC Certified"]
    },
    {
      id: 3,
      name: "Construction Plywood Co.",
      avatar: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      rating: 4.5,
      description: "Heavy-duty plywood solutions for all construction and structural applications.",
      tags: ["Construction", "Structural", "Waterproof"]
    },
    {
      id: 4,
      name: "Architectural Ply",
      avatar: "https://images.unsplash.com/photo-1581094271901-8022df4466f9?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      rating: 4.9,
      description: "Premium decorative plywood and veneers for architectural and interior design projects.",
      tags: ["Decorative", "Architectural", "Interior Design"]
    }
  ];

  return (
    <main className="container mx-auto px-4 py-6 md:py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Our Trusted Suppliers</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Connect directly with these vetted plywood suppliers to source high-quality materials for your projects.
          Each supplier is evaluated on product quality, reliability, and customer service.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sampleSuppliers.map((supplier) => (
          <SupplierCard key={supplier.id} supplier={supplier} />
        ))}
      </div>
    </main>
  );
}