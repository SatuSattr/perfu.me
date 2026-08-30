import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function ProductGallery({ images = [], alt = '' }) {
  const [current, setCurrent] = useState(0);
  const gallery = images.length ? images : ['/assets/products/dynamyst-transparent.png'];

  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(gallery.length - 1, c + 1));

  return (
    <div className="flex flex-col gap-4 lg:sticky lg:top-[90px]">
      <div className="relative bg-[#f9f9f9] rounded-2xl overflow-hidden aspect-square flex items-center justify-center">
        <img src={gallery[current]} alt={alt} className="h-full w-full object-cover" />
        {gallery.length > 1 && (
          <>
            <button type="button" aria-label="Foto sebelumnya" onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white border border-[#e6e6e6] flex items-center justify-center text-[#555] transition-colors duration-200 cursor-pointer">
              <ChevronLeft size={16} strokeWidth={2} />
            </button>
            <button type="button" aria-label="Foto berikutnya" onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white border border-[#e6e6e6] flex items-center justify-center text-[#555] transition-colors duration-200 cursor-pointer">
              <ChevronRight size={16} strokeWidth={2} />
            </button>
          </>
        )}
      </div>

      {gallery.length > 1 && (
        <div className="flex gap-2 justify-center">
          {gallery.map((src, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Lihat foto ${i + 1}`}
              onClick={() => setCurrent(i)}
              className={`w-16 h-16 rounded-xl overflow-hidden transition-all duration-200 cursor-pointer flex items-center justify-center bg-[#f9f9f9] border-2 ${current === i ? 'border-[#1a1a1a]' : 'border-transparent hover:border-[#ccc]'}`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
