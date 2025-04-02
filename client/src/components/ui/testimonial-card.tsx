interface TestimonialCardProps {
  testimonial: {
    id: number;
    rating: number;
    text: string;
    author: string;
    title: string;
    avatar: string;
  };
}

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  // Render stars based on rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex text-amber-400 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill={star <= rating ? "currentColor" : "none"}
            stroke={star > rating ? "currentColor" : "none"}
          >
            {star <= rating ? (
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            )}
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 transition-shadow hover:shadow-md">
      {renderStars(testimonial.rating)}
      <p className="text-gray-600 italic mb-4">{testimonial.text}</p>
      <div className="flex items-center">
        <img 
          src={testimonial.avatar} 
          alt={testimonial.author} 
          className="w-10 h-10 rounded-full object-cover mr-3" 
        />
        <div>
          <h4 className="font-medium text-gray-800">{testimonial.author}</h4>
          <p className="text-gray-500 text-sm">{testimonial.title}</p>
        </div>
      </div>
    </div>
  );
}
