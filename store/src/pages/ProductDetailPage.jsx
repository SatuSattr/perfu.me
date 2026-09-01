import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ProductGallery } from '../components/product/ProductGallery';
import { StarRating } from '../components/product/StarRating';
import { ReviewList } from '../components/product/ReviewList';
import { Pill } from '../components/ui/Badge';
import { Select, ChoiceGroup } from '../components/ui/Select';
import { QuantityControl } from '../components/ui/QuantityControl';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { fetchProduct, fetchProducts, resolveImage } from '../lib/api';
import { GallerySkeleton } from '../components/ui/Skeleton';

export function ProductDetailPage() {
  const { slug: paramSlug } = useParams();
  const searchSlug = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('slug');
  const slug = paramSlug || searchSlug || 'dynamyst';

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [recommended, setRecommended] = useState([]);

  const [selectedOptions, setSelectedOptions] = useState({});
  const [qty, setQty] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const { addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setNotFound(false);
    setSelectedOptions({});
    fetchProduct(slug, { signal: ctrl.signal })
      .then((data) => {
        if (data) {
          setProduct(data);
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      })
      .catch((e) => {
        if (e.name === 'AbortError') return;
        if (e.status === 404) setNotFound(true);
        else setNotFound(true);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    const ctrl = new AbortController();
    fetchProducts({ per_page: 3, sort: 'latest' }, { signal: ctrl.signal })
      .then((res) => {
        const list = res.data ?? [];
        const filtered = list.filter((p) => p.slug !== product.slug).slice(0, 2);
        setRecommended(filtered);
      })
      .catch((e) => {
        if (e.name === 'AbortError') return;
        setRecommended([]);
      });
    return () => ctrl.abort();
  }, [product]);

  const avgRating = useMemo(() => {
    if (!product || !product.reviews?.length) return 0;
    return Math.round(product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length);
  }, [product]);

  const displayPrice = useMemo(() => {
    if (!product) return 0;
    const baseOpt = product.options?.find((o) => o.is_base);
    let base = 0;
    if (baseOpt) {
      if (selectedOptions[baseOpt.id]) {
        const choice = baseOpt.choices.find((c) => c.id === selectedOptions[baseOpt.id]);
        base = choice?.price ?? Math.min(...baseOpt.choices.map((c) => c.price ?? 0));
      } else {
        base = Math.min(...baseOpt.choices.map((c) => c.price ?? 0));
      }
    } else if (product.options?.length) {
      const cheapest = Math.min(...product.options.flatMap((o) => o.choices.map((c) => c.price ?? 0)));
      base = cheapest;
      const selGroup = product.options.find((g) => selectedOptions[g.id]);
      if (selGroup) {
        const c = selGroup.choices.find((x) => x.id === selectedOptions[selGroup.id]);
        if (c?.price) base = c.price;
      }
      return base;
    } else {
      base = product.price ?? 0;
    }
    const addon = product.options
      ?.filter((o) => !o.is_base)
      .reduce((sum, g) => {
        const sel = selectedOptions[g.id];
        if (!sel) return sum;
        const choice = g.choices.find((c) => c.id === sel);
        return sum + (choice?.price ?? 0);
      }, 0) ?? 0;
    return base + addon;
  }, [product, selectedOptions]);

  const cartDisabled = useMemo(() => {
    if (!product) return true;
    const hasOptions = product.options && product.options.length > 0;
    if (!hasOptions && product.stock !== null && product.stock !== undefined && product.stock <= 0) return true;
    if (hasOptions) {
      const requiredGroups = product.options.filter((g) => {
        if (!g.required) return false;
        if (g.is_base && g.choices.length === 1) return false;
        return true;
      });
      return requiredGroups.some((g) => !selectedOptions[g.id]);
    }
    return false;
  }, [product, selectedOptions]);

  const availableStock = useMemo(() => {
    if (!product || !product.options?.length) return product?.stock ?? null;
    const baseOpt = product.options.find((o) => o.is_base);
    if (baseOpt && baseOpt.choices.length === 1 && baseOpt.required && !selectedOptions[baseOpt.id]) {
      return baseOpt.choices[0].stock;
    }
    const stocks = product.options
      .map((g) => {
        const sel = selectedOptions[g.id];
        if (!sel) return null;
        const choice = g.choices.find((c) => c.id === sel);
        return choice?.stock ?? null;
      })
      .filter((s) => s !== null);
    if (stocks.length === 0) return null;
    return Math.min(...stocks);
  }, [product, selectedOptions]);

  function selectOption(groupId, value) {
    setSelectedOptions((prev) => ({ ...prev, [groupId]: value }));
  }

  function handleAddToCart() {
    if (cartDisabled) return;
    const selectedLabels = {};
    (product.options || []).forEach((group) => {
      let selId = selectedOptions[group.id];
      if (!selId && group.is_base && group.choices.length === 1 && group.required) {
        selId = group.choices[0].id;
      }
      if (selId) {
        const choice = group.choices.find((c) => c.id === selId);
        if (choice) selectedLabels[group.label] = choice.name;
      }
    });
    const maxStock = availableStock ?? 999;
    if (qty > maxStock) {
      toast.error(`Stok hanya ${maxStock}`);
      return;
    }
    addItem(
      {
        id: product.id,
        name: product.name,
        price: displayPrice,
        image: product.image,
        selectedOptions: selectedLabels,
        qty,
      },
      { maxStock },
    );
    setAddedFeedback(true);
    toast.success(`${product.name} ditambahkan ke keranjang`);
    setTimeout(() => setAddedFeedback(false), 1500);
  }

  if (loading) {
    return (
      <div className="pt-[80px] min-h-screen">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <GallerySkeleton />
          <div className="mt-8 flex flex-col gap-4">
            <div className="h-6 w-1/3 bg-[#f0f0f0] animate-pulse rounded" />
            <div className="h-4 w-full bg-[#f0f0f0] animate-pulse rounded" />
            <div className="h-10 w-full bg-[#f0f0f0] animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="pt-[80px] min-h-screen flex flex-col items-center justify-center px-8 py-20">
        <h1 className="font-sans text-[22px] font-semibold text-[#1a1a1a]">Produk tidak ditemukan</h1>
        <p className="font-sans text-[13px] text-[#888] mt-2 text-center">Tautan mungkin salah atau produk telah dihapus.</p>
        <Link to="/products" className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] text-white text-[11px] uppercase tracking-[0.12em] rounded-full no-underline">
          Kembali ke Koleksi
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-[80px] min-h-screen">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <GallerySkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[80px] min-h-screen">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <Link to="/products" className="inline-flex items-center gap-1.5 font-sans text-[11px] uppercase tracking-[0.12em] text-[#aaa] no-underline hover:text-[#1a1a1a] transition-colors duration-200 mb-10">
          <ArrowLeft size={13} strokeWidth={2} />
          Kembali ke Koleksi
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Gallery via reusable component */}
          <ProductGallery images={product.media ?? product.images} alt={product.name + ' foto'} />

          {/* Info */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 flex-wrap">
              <Pill>{product.category}</Pill>
              <Pill>{product.gender}</Pill>
            </div>

            <div>
              <h1 className="font-sans text-[32px] font-semibold text-[#1a1a1a] tracking-tight leading-tight">{product.name}</h1>
              <p className="font-sans text-[13px] text-[#999] tracking-[0.06em] mt-1">{product.tagline}</p>
            </div>

            {product.reviews?.length > 0 && (
              <div className="flex items-center gap-2">
                <StarRating value={avgRating} size={14} />
                <span className="font-sans text-[11px] text-[#888]">{avgRating}/5 · {product.reviews.length} ulasan</span>
              </div>
            )}

            <p className="font-sans text-[13.5px] text-[#555] leading-[1.8]">{product.description}</p>

            {/* Options: dropdown via Select & normal via ChoiceGroup */}
            {(() => {
              const visibleGroups = (product.options || []).filter((g) => !(g.is_base && g.choices.length === 1 && g.required));
              if (visibleGroups.length === 0) return null;
              return (
                <div className="flex flex-col gap-5">
                  {visibleGroups.map((group) => (
                    <div key={group.id}>
                      {group.mode === 'dropdown' ? (
                        <Select
                          label={group.label}
                          required={group.required}
                          value={selectedOptions[group.id] || ''}
                          onChange={(e) => selectOption(group.id, e.target.value)}
                          placeholder="Pilih aroma..."
                        >
                          {group.choices.map((choice) => (
                            <option key={choice.id} value={choice.id} disabled={choice.stock <= 0}>
                              {choice.name}{choice.stock <= 0 ? ' (Habis)' : ''}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <ChoiceGroup
                          label={group.label}
                          required={group.required}
                          options={group.choices}
                          value={selectedOptions[group.id]}
                          onChange={(v) => selectOption(group.id, v)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}

            <div className="flex items-baseline gap-3">
              <span className="font-sans text-[28px] font-semibold text-[#1a1a1a]">{'Rp ' + displayPrice.toLocaleString('id-ID')}</span>
            </div>

            {(() => {
              const baseOpt = product.options?.find((o) => o.is_base);
              const baseSelected = baseOpt ? baseOpt.choices.find((c) => c.id === selectedOptions[baseOpt.id]) : null;
              const isOut = baseSelected ? baseSelected.stock <= 0 : false;
              return isOut ? <p className="font-sans text-[11px] text-red-500 uppercase tracking-[0.08em]">Stok Habis</p> : null;
            })()}

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <QuantityControl value={qty} onDecrease={() => setQty((q) => Math.max(1, q - 1))} onIncrease={() => setQty((q) => Math.min(availableStock ?? 99, q + 1))} />
                {availableStock !== null && (
                  <span className="font-sans text-[12px] text-[#888]">Tersedia {availableStock}</span>
                )}
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={cartDisabled}
                className={`w-full px-6 py-3 text-white text-[11px] font-medium uppercase tracking-[0.12em] rounded font-sans cursor-pointer border-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${addedFeedback ? 'bg-green-600' : 'bg-[#1a1a1a] hover:bg-[#333]'}`}
              >
                {addedFeedback ? 'Ditambahkan!' : 'Tambah ke Keranjang'}
              </button>
            </div>
          </div>
        </div>

        <ReviewList reviews={product.reviews} />

        <div className="mt-16 pt-12 border-t border-[#f2f2f2]">
          <h2 className="font-sans text-[18px] font-semibold text-[#1a1a1a] mb-8">Produk Lainnya</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommended.map((rec) => {
              const hoverImg = rec.detailImage || rec.images?.[1];
              const hasHover = Boolean(hoverImg && hoverImg !== rec.image);
              const recPrice = (() => {
                const b = rec.options?.find((o) => o.is_base);
                if (b?.choices?.length) return Math.min(...b.choices.map((c) => c.price ?? 0));
                return rec.price ?? 0;
              })();
              return (
                <article key={rec.id} className="group flex flex-col bg-white border border-[#e6e6e6] rounded-2xl overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                  <Link to={`/product/${rec.slug}`} className="block relative bg-[#f7f7f7] flex items-center justify-center h-64 no-underline">
                    <img src={resolveImage(rec.image)} alt={rec.name} className={`h-52 w-auto object-contain drop-shadow-md transition-opacity duration-500 ease-in-out ${hasHover ? 'group-hover:opacity-0' : ''}`} />
                    {hasHover && <img src={resolveImage(hoverImg)} alt={rec.name + ' detail'} className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100" />}
                  </Link>
                  <div className="flex flex-col gap-3 px-5 py-4 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div><h2 className="font-sans text-[0.95rem] font-semibold tracking-[0.01em] text-[#1a1a1a]">{rec.name}</h2><span className="font-sans text-[0.85rem] text-[#1a1a1a] font-medium">{'Rp ' + recPrice.toLocaleString('id-ID')}</span></div>
                      <span className="font-sans text-[9px] uppercase tracking-[0.12em] text-[#888] bg-[#f5f5f5] px-2 py-1 rounded shrink-0">{rec.category}</span>
                    </div>
                    <p className="font-sans text-[11.5px] leading-[1.7] text-[#888]" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{rec.description}</p>
                    <Link to={`/product/${rec.slug}`} className="mt-auto font-sans text-[10px] font-medium uppercase tracking-[0.15em] text-[#1a1a1a] no-underline border border-[#e0e0e0] rounded px-4 py-2 text-center hover:bg-[#f5f5f5] transition-colors duration-200">Lihat Detail</Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
