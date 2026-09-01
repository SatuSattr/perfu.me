import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { resolveImage } from '../../lib/api';

export function ProductGallery({ images = [], media = null, alt = '' }) {
  const [current, setCurrent] = useState(0);
  const raw = media ?? images;
  const normalized = raw.map((m) => {
    if (typeof m === 'string') {
      const isVid = /\.(mp4|webm|mov)$/i.test(m);
      return { path: m, type: isVid ? 'video' : 'image' };
    }
    return { path: m.path ?? m.src ?? '', type: m.type ?? 'image' };
  });
  const gallery = normalized.length ? normalized : [];

  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(gallery.length - 1, c + 1));

  if (!gallery.length) {
    return (
      <div className="flex flex-col gap-4 lg:sticky lg:top-[90px]">
        <div className="bg-[#f9f9f9] rounded-2xl aspect-square flex items-center justify-center font-sans text-[12px] text-[#aaa]">Tidak ada foto</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 lg:sticky lg:top-[90px]">
      <div className="relative bg-[#f9f9f9] rounded-2xl overflow-hidden aspect-square flex items-center justify-center">
        {gallery[current].type === 'video' ? (
          <video src={resolveImage(gallery[current].path)} controls preload="metadata" playsInline className="h-full w-full object-cover" />
        ) : (
          <img src={resolveImage(gallery[current].path)} alt={alt} className="h-full w-full object-cover" />
        )}
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
          {gallery.map((item, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Lihat ${item.type === 'video' ? 'video' : 'foto'} ${i + 1}`}
              onClick={() => setCurrent(i)}
              className={`w-16 h-16 rounded-xl overflow-hidden transition-all duration-200 cursor-pointer flex items-center justify-center bg-[#f9f9f9] border-2 relative ${current === i ? 'border-[#1a1a1a]' : 'border-transparent hover:border-[#ccc]'}`}
            >
              {item.type === 'video' ? (
                <>
                  <video src={resolveImage(item.path)} className="w-full h-full object-cover" muted preload="metadata" playsInline />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
                  </span>
                </>
              ) : (
                <img src={resolveImage(item.path)} alt="" className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
