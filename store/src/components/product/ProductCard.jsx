import { Link } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { resolveImage } from '../../lib/api';

export function ProductCard({ product }) {
  const hoverImage = product.detailImage || product.images?.[1];
  const hasHover = Boolean(hoverImage && hoverImage !== product.image);
  const resolvedImage = resolveImage(product.image);
  const resolvedHover = hoverImage ? resolveImage(hoverImage) : null;
  const displayPrice = (() => {
    const baseOpt = product.options?.find((o) => o.is_base);
    if (baseOpt?.choices?.length) {
      const min = Math.min(...baseOpt.choices.map((c) => c.price ?? 0));
      return min;
    }
    if (product.options?.length) {
      const allPrices = product.options.flatMap((o) => o.choices.map((c) => c.price ?? 0));
      if (allPrices.length) return Math.min(...allPrices);
    }
    return product.price ?? 0;
  })();
  return (
    <article className="group flex flex-col bg-white border border-[#e6e6e6] rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
      <Link
        to={`/product/${product.slug}`}
        className="block relative bg-[#f7f7f7] flex items-center justify-center h-40 sm:h-56 lg:h-64 no-underline overflow-hidden"
      >
        <img
          src={resolvedImage}
          alt={product.name}
          className={`h-28 sm:h-40 lg:h-52 w-auto object-contain drop-shadow-md transition-opacity duration-500 ease-in-out ${hasHover ? 'group-hover:opacity-0' : ''}`}
        />
        {hasHover && resolvedHover && (
          <img
            src={resolvedHover}
            alt={product.name + ' detail'}
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100"
          />
        )}
      </Link>
      <div className="flex flex-col gap-2 sm:gap-3 px-3 sm:px-5 py-3 sm:py-4 flex-1">
        <div className="flex items-start justify-between gap-1.5 sm:gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="font-sans text-[13px] sm:text-[0.95rem] font-semibold tracking-[0.01em] text-[#1a1a1a] leading-tight truncate">
              {product.name}
            </h2>
            <span className="font-sans text-[12px] sm:text-[0.85rem] text-[#1a1a1a] font-medium block mt-0.5">
              {'Rp ' + displayPrice.toLocaleString('id-ID')}
            </span>
          </div>
          <Badge className="text-[7px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 sm:py-1 shrink-0">{product.category}</Badge>
        </div>
        {/* Description: hidden on mobile to keep card compact (Shopee/Tokopedia style), visible from sm */}
        <p
          className="hidden sm:block font-sans text-[11.5px] leading-[1.7] text-[#888] overflow-hidden"
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {product.description}
        </p>
        {product.sizeLabel && (
          <p className="hidden sm:block font-sans text-[10px] tracking-[0.04em] text-[#aaa]">{product.sizeLabel}</p>
        )}
        <Link
          to={`/product/${product.slug}`}
          className="mt-auto font-sans text-[9px] sm:text-[10px] font-medium uppercase tracking-[0.12em] sm:tracking-[0.15em] text-[#1a1a1a] no-underline border border-[#e0e0e0] rounded-md sm:rounded px-3 sm:px-4 py-1.5 sm:py-2 text-center hover:bg-[#f5f5f5] transition-colors duration-200"
        >
          Lihat Detail
        </Link>
      </div>
    </article>
  );
}
