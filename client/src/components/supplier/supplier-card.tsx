import { Button } from '@/components/ui/button';

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
  // Render stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        // Full star
        stars.push(
          <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      } else if (i - 0.5 <= rating) {
        // Half star
        stars.push(
          <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a.75.75 0 01.671.415l2.652 5.379 5.926.862a.75.75 0 01.416 1.279l-4.292 4.187 1.013 5.9a.75.75 0 01-1.089.79L10 17.698l-5.297 2.784a.75.75 0 01-1.09-.79l1.014-5.9-4.292-4.187a.75.75 0 01.416-1.28l5.926-.86 2.652-5.38A.75.75 0 0110 2zm0 3.34L8.358 8.92a.75.75 0 01-.565.41l-4.045.588 2.927 2.852a.75.75 0 01.216.664l-.691 4.023 3.602-1.893a.75.75 0 01.698 0L14.1 17.457l-.69-4.023a.75.75 0 01.215-.664l2.928-2.852-4.046-.588a.75.75 0 01-.564-.41L10 5.34z" clipRule="evenodd" />
          </svg>
        );
      } else {
        // Empty star
        stars.push(
          <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      }
    }
    return stars;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <img 
            src={supplier.avatar} 
            alt={supplier.name} 
            className="w-12 h-12 rounded-full object-cover mr-4" 
          />
          <div>
            <h3 className="font-semibold text-lg text-gray-800">{supplier.name}</h3>
            <div className="flex items-center text-sm">
              <div className="flex">
                {renderStars(supplier.rating)}
              </div>
              <span className="text-gray-600 ml-1">({supplier.rating.toFixed(1)})</span>
            </div>
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-4">{supplier.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {supplier.tags.map((tag, index) => (
            <span key={index} className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
        <Button className="w-full bg-secondary text-white py-2 px-4 rounded-md hover:bg-secondary-dark transition-colors">
          View Products
        </Button>
      </div>
    </div>
  );
}
