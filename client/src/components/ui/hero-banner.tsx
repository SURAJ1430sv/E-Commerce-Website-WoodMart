import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

interface HeroBannerProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageSrc: string;
}

export default function HeroBanner({
  title,
  description,
  buttonText,
  buttonLink,
  imageSrc
}: HeroBannerProps) {
  return (
    <div className="relative bg-gray-900 rounded-xl overflow-hidden mb-8">
      <img 
        src={imageSrc} 
        className="w-full h-64 md:h-96 object-cover mix-blend-overlay" 
        alt="Hero banner"
      />
      <div className="absolute inset-0 flex flex-col justify-center items-start p-8 md:p-12">
        <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
          {title}
        </h1>
        <p className="text-white text-lg md:text-xl mb-6 max-w-2xl">
          {description}
        </p>
        <Link href={buttonLink}>
          <Button className="px-6 py-3 h-auto bg-amber-400 text-white rounded-md hover:bg-amber-500 transition-colors transform hover:-translate-y-1 duration-200">
            {buttonText}
          </Button>
        </Link>
      </div>
    </div>
  );
}
