

interface PartialStarRatingProps {
  rating: number;
  maxRating?: number;
  className?: string;
  size?: number;
}

export function PartialStarRating({ 
  rating, 
  maxRating = 5, 
  className = "", 
  size = 12 
}: PartialStarRatingProps) {
  // Calculate percentage (0 to 100)
  const percentage = Math.min(Math.max((rating / maxRating) * 100, 0), 100);
  
  // Use a stable but unique ID for the gradient based on the rating value
  // This prevents hydration mismatches compared to Math.random()
  const gradientId = `star-gradient-${rating.toString().replace('.', '-')}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={`url(#${gradientId})`}
      stroke="none"
      className={className}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset={`${percentage}%`} stopColor="#F59E0B" /> {/* Amber 500 */}
          <stop offset={`${percentage}%`} stopColor="#E2E8F0" /> {/* Slate 200 */}
        </linearGradient>
      </defs>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
