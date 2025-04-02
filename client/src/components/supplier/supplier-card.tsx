import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface SupplierCardProps {
  supplier: {
    id: number;
    name: string;
    avatar: string;
    rating: number;
    description: string;
    tags: string[];
  };
}

export default function SupplierCard({ supplier }: SupplierCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/3">
          <img 
            src={supplier.avatar} 
            alt={supplier.name} 
            className="h-full w-full object-cover"
            style={{ minHeight: "200px" }}
          />
        </div>
        
        <div className="w-full md:w-2/3">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl">{supplier.name}</CardTitle>
              <div className="flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                <span>{supplier.rating.toFixed(1)}</span>
              </div>
            </div>
            <CardDescription>{supplier.description}</CardDescription>
          </CardHeader>
          
          <CardContent className="pb-2">
            <div className="flex flex-wrap gap-2 mb-4">
              {supplier.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="bg-gray-100">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button variant="outline" className="text-primary border-primary hover:bg-primary/5">
              View Products
            </Button>
            <Button className="bg-primary hover:bg-primary-dark">
              Contact Supplier
            </Button>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}