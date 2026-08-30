import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { products, getProductBySlug } from '../data/products';
import { ProductGallery } from '../components/product/ProductGallery';
import { StarRating } from '../components/product/StarRating';
import { ReviewList } from '../components/product/ReviewList';
import { Pill } from '../components/ui/Badge';
import { Select, ChoiceGroup } from '../components/ui/Select';
import { QuantityControl } from '../components/ui/QuantityControl';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export function ProductDetailPage() {
  const { slug: paramSlug } = useParams();
  // support legacy ?slug=xxx query param (product-detail.html?slug=)
  const searchSlug = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('slug');
  const slug = paramSlug || searchSlug || 'dynamyst';
  const product = useMemo(() => getProductBySlug(slug), [slug]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [qty, setQty] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const { addItem } = useCart();
  const { toast } = useToast();

  const avgRating = useMemo(() => {
    if (!product.reviews?.length) return 0;
    return Math.round(product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length);
  }, [product]);

  const displayPrice = useMemo(() => {
    let base = product.price ?? 0;
    const ukuranGroup = product.options?.find((g) => g.id === 'ukuran');
    if (ukuranGroup && selectedOptions['ukuran']) {
      const choice = ukuranGroup.choices.find((c) => c.id === selectedOptions['ukuran']);
      if (choice?.price) base = choice.price;
    }
    return base;
  }, [product, selectedOptions]);

  const cartDisabled = useMemo(() => {
    const hasOptions = product.options && product.options.length > 0;
    if (!hasOptions && product.stock !== null && product.stock <= 0) return true;
    if (hasOptions) {
      const requiredGroups = product.options.filter((g) => g.required);
      return requiredGroups.some((g) => !selectedOptions[g.id]);
    }
    return false;
  }, [product, selectedOptions]);

  const recommended = products.filter((p) => p.slug !== product.slug).slice(0, 2);

  const availableStock = useMemo(() => {
    // No options: use product.stock directly
    if (!product.options?.length) return product.stock;
    // With options: collect stock of each selected choice, effective = min (bottleneck)
    const stocks = product.options
      .map((g) => {
        const sel = selectedOptions[g.id];
        if (!sel) return null;
        const choice = g.choices.find((c) => c.id === sel);
        return choice?.stock ?? null;
      })
      .filter((s) => s !== null);
    if (stocks.length === 0) return null; // belum ada pilihan → jangan tampilkan
    return Math.min(...stocks);
  }, [product, selectedOptions]);

  function selectOption(groupId, value) {
    setSelectedOptions((prev) => ({ ...prev, [groupId]: value }));
  }

  function handleAddToCart() {
    if (cartDisabled) return;
    const selectedLabels = {};
    (product.options || []).forEach((group) => {
      if (selectedOptions[group.id]) {
        const choice = group.choices.find((c) => c.id === selectedOptions[group.id]);
        if (choice) selectedLabels[group.label] = choice.name;
      }
    });
    addItem({
      id: product.id,
      name: product.name,
      price: displayPrice,
      image: product.image,
      selectedOptions: selectedLabels,
      qty,
    });
    setAddedFeedback(true);
    toast.success(`${product.name} ditambahkan ke keranjang`);
    setTimeout(() => setAddedFeedback(false), 1500);
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
          <ProductGallery images={product.images} alt={product.name + ' foto'} />

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
            {product.options?.length > 0 && (
              <div className="flex flex-col gap-5">
                {product.options.map((group) => (
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
            )}

            <div className="flex items-baseline gap-3">
              <span className="font-sans text-[28px] font-semibold text-[#1a1a1a]">{'Rp ' + displayPrice.toLocaleString('id-ID')}</span>
            </div>

            {product.stock !== null && product.stock <= 0 && <p className="font-sans text-[11px] text-red-500 uppercase tracking-[0.08em]">Stok Habis</p>}

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <QuantityControl value={qty} onDecrease={() => setQty((q) => Math.max(1, q - 1))} onIncrease={() => setQty((q) => q + 1)} />
                {availableStock !== null && (
                  <span className="font-sans text-[12px] text-[#888]">
                    Tersedia {availableStock}
                  </span>
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
              return (
              <article key={rec.id} className="group flex flex-col bg-white border border-[#e6e6e6] rounded-2xl overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                <Link to={`/product/${rec.slug}`} className="block relative bg-[#f7f7f7] flex items-center justify-center h-64 no-underline">
                  <img src={rec.image} alt={rec.name} className={`h-52 w-auto object-contain drop-shadow-md transition-opacity duration-500 ease-in-out ${hasHover ? 'group-hover:opacity-0' : ''}`} />
                  {hasHover && <img src={hoverImg} alt={rec.name + ' detail'} className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100" />}
                </Link>
                <div className="flex flex-col gap-3 px-5 py-4 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div><h2 className="font-sans text-[0.95rem] font-semibold tracking-[0.01em] text-[#1a1a1a]">{rec.name}</h2><span className="font-sans text-[0.85rem] text-[#1a1a1a] font-medium">{'Rp ' + rec.price.toLocaleString('id-ID')}</span></div>
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
