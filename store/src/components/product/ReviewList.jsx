import { useState } from 'react';
import { StarRating } from './StarRating';

export function ReviewList({ reviews = [] }) {
  const [expanded, setExpanded] = useState(false);
  if (!reviews.length) return null;
  const visible = expanded ? reviews : reviews.slice(0,3);

  return (
    <div className="mt-16 pt-12 border-t border-[#f2f2f2]">
      <h2 className="font-sans text-[18px] font-semibold text-[#1a1a1a] mb-8">Ulasan Pelanggan ({reviews.length})</h2>
      <div className="flex flex-col gap-6">
        {visible.map((review, i) => (
          <div key={i} className="flex flex-col gap-3 pb-6 border-b border-[#f5f5f5] last:border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-sans text-[13px] font-semibold text-[#1a1a1a]">{review.name}</p>
                <p className="font-sans text-[11px] text-[#aaa]">{review.date}</p>
              </div>
              <StarRating value={review.rating} size={12} />
            </div>
            <p className="font-sans text-[12.5px] text-[#555] leading-[1.7]">{review.message}</p>
          </div>
        ))}
      </div>
      {reviews.length > 3 && (
        <div className="mt-6 text-center">
          <button type="button" onClick={()=> setExpanded(!expanded)} className="font-sans text-[10px] uppercase tracking-[0.14em] px-6 py-2.5 rounded-full border border-[#e6e6e6] text-[#888] hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-colors duration-200 cursor-pointer">
            {expanded ? 'Sembunyikan ulasan' : `Lihat ${reviews.length - 3} ulasan lainnya`}
          </button>
        </div>
      )}
    </div>
  );
}
