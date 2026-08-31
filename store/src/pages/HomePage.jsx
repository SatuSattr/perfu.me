import {
  Package,
  Gift,
  Star,
  Tag,
  TrendingUp,
  Truck,
  MapPin,
} from "lucide-react";
import { products, testimonials, badges } from "../data/products";
import { ProductCard } from "../components/product/ProductCard";
import { StarRating } from "../components/product/StarRating";
import { CtaButtonGroup } from "../components/ui/CtaButton";

const lucideIconMap = {
  package: Package,
  gift: Gift,
  star: Star,
  tag: Tag,
  "trending-up": TrendingUp,
  truck: Truck,
  "map-pin": MapPin,
};

function BadgeIcon({ name }) {
  const Icon = lucideIconMap[name];
  if (!Icon) return null;
  return (
    <span className="p-1 rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0">
      <Icon size={14} color="white" strokeWidth={2} aria-hidden="true" />
    </span>
  );
}

export function HomePage() {
  const doubled = [...testimonials, ...testimonials];

  return (
    <div className="pt-[16px]">
      <div className="mx-4">
        <section className="relative max-w-7xl lg:px-4 mx-auto mt-[100px] h-72 flex items-center overflow-hidden rounded-2xl">
          <img
            src="/assets/hero-brand.png"
            alt="Perfu.me brand"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.25) 50%, transparent)",
            }}
          />
          <div className="relative z-10 flex items-center justify-between w-full h-full px-8">
            <div className="max-w-xs">
              <h1 className="font-serif text-[clamp(1.8rem,4vw,2.8rem)] font-normal tracking-[0.08em] text-white leading-[1.15] mb-3">
                Perfu<span className="text-white/50">.</span>me
              </h1>
              <p
                className="font-sans text-sm text-white/90 tracking-[0.04em] mb-5 leading-[1.7]"
                style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}
              >
                Koleksi parfum signature dan inspired dengan karakter yang kuat,
                dibuat untuk menemani setiap momenmu.
              </p>
              <CtaButtonGroup />
            </div>
          </div>
        </section>
      </div>

      <div className="pt-10 mx-4">
        <section className="max-w-7xl mx-auto">
          <div className="mb-10 flex flex-col gap-2">
            <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-[#aaa]">
              Koleksi Kami
            </span>
            <h2 className="font-sans text-[clamp(1.4rem,3vw,2rem)] font-semibold tracking-[0.01em] text-[#1a1a1a] leading-none">
              Temukan Wangimu
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </div>

      <section className="mt-10 mx-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 min-h-[520px] gap-8">
          <div className="relative min-h-[360px] lg:min-h-0 bg-[#f7f7f7] overflow-hidden rounded-2xl">
            <img
              src="/assets/brand-story.png"
              alt="Perfu.me brand story"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center gap-6 py-16 lg:py-20 lg:pl-8">
            <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-[#aaa]">
              Tentang Kami
            </span>
            <h2 className="font-sans text-[clamp(1.4rem,3vw,2.2rem)] font-semibold tracking-[0.01em] text-[#1a1a1a] leading-[1.35]">
              Setiap orang berhak tampil harum tanpa harus mengeluarkan biaya
              yang mahal.
            </h2>
            <p className="font-sans text-[12.5px] leading-[1.9] text-[#666] max-w-md">
              Perfu.me lahir dari keyakinan sederhana itu. Kami menghadirkan
              parfum dengan aroma berkarakter, kualitas yang terasa premium, dan
              harga yang tetap ramah di kantong — karena bagi kami, parfum
              adalah cara seseorang mengekspresikan dirinya.
            </p>
            <div className="flex gap-8 pt-2 flex-wrap">
              <div>
                <p className="font-sans text-[1.8rem] font-semibold text-[#1a1a1a] leading-none">
                  40+
                </p>
                <p className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#aaa] mt-1">
                  Pilihan Aroma
                </p>
              </div>
              <div>
                <p className="font-sans text-[1.8rem] font-semibold text-[#1a1a1a] leading-none">
                  2
                </p>
                <p className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#aaa] mt-1">
                  Signature Scent
                </p>
              </div>
              <div>
                <p className="font-sans text-[1.8rem] font-semibold text-[#1a1a1a] leading-none">
                  100%
                </p>
                <p className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#aaa] mt-1">
                  Lokal Indonesia
                </p>
              </div>
            </div>
            <CtaButtonGroup
              primaryLabel="Lihat Koleksi"
              primaryBackground="bg-[#1a1a1a]"
              primaryColor="text-white"
              primaryOutline="border border-[#1a1a1a]"
              primaryHover="hover:bg-[#333]"
              secondaryBackground="bg-transparent"
              secondaryColor="text-[#1a1a1a]"
              secondaryOutline="border border-[#1a1a1a]"
              secondaryHover="hover:bg-[#1a1a1a] hover:text-white"
            />
          </div>
        </div>
      </section>

      <section className="mt-16 overflow-hidden">
        <div className="max-w-7xl mx-auto mb-10">
          <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-[#aaa]">
            Testimoni
          </span>
          <h2 className="font-sans text-[clamp(1.4rem,3vw,2rem)] font-semibold tracking-[0.01em] text-[#1a1a1a] leading-none mt-2">
            Apa Kata Mereka
          </h2>
        </div>
        <div className="w-full overflow-hidden">
          <div
            className="flex gap-4 w-max"
            style={{ animation: "marquee 60s linear infinite" }}
          >
            {doubled.map((t, i) => (
              <div
                key={i}
                className="w-[280px] shrink-0 border border-[#e6e6e6] rounded-2xl p-5 bg-white flex flex-col gap-3"
              >
                <StarRating value={t.rating} size={12} />
                <p className="font-sans text-[12.5px] leading-[1.7] text-[#444] flex-1">
                  "{t.quote}"
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-black/5">
                  <div>
                    <p className="font-sans text-[12px] font-semibold text-[#1a1a1a]">
                      {t.name}
                    </p>
                    <p className="font-sans text-[10px] text-[#aaa]">
                      {t.product}
                    </p>
                  </div>
                  <p className="font-sans text-[10px] text-[#ccc]">{t.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="w-full max-w-[1100px] mx-auto py-8 md:py-12 px-4">
        <ul
          className="flex flex-wrap justify-center gap-3"
          aria-label="Keunggulan toko"
        >
          {badges.map((b) => (
            <li key={b.label}>
              <div className="flex items-center gap-2.5 bg-[#f5f5f5] hover:bg-[#ebebeb] hover:scale-[1.03] transition-all duration-200 rounded-full px-4 py-2 cursor-default">
                <BadgeIcon name={b.icon} />
                <span className="font-sans text-[14px] text-[#1a1a1a] whitespace-nowrap">
                  {b.label}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
