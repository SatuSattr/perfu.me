import { Star } from 'lucide-react';

export function StarRating({ value = 0, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={2}
          className={i < value ? 'text-amber-400 fill-amber-400' : 'text-[#ddd] fill-[#ddd]'}
          fill="currentColor"
        />
      ))}
    </div>
  );
}
