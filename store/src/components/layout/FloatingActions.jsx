import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { WhatsappIcon } from "../ui/BrandIcon";

export function FloatingActions() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-40">
      {showScrollTop && (
        <button
          type="button"
          aria-label="Kembali ke atas"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="rounded-full p-4 bg-white border border-[#e6e6e6] text-[#888] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-all duration-200 cursor-pointer"
        >
          <ChevronUp size={25} strokeWidth={2} />
        </button>
      )}
      <a
        href="https://wa.me/6281383415432"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat via WhatsApp"
        className="flex items-center gap-2 bg-[#25D366] text-white no-underline p-4 rounded-full shadow-[0_4px_14px_rgba(37,211,102,0.35)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.45)]"
      >
        <WhatsappIcon size={25} />
      </a>
    </div>
  );
}
