import { useEffect, useMemo, useState } from 'react';
import { ProductCard } from '../components/product/ProductCard';
import { SearchInput } from '../components/ui/Input';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { fetchProducts } from '../lib/api';

export function ProductsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const filters = ['Semua', 'Pria', 'Wanita', 'Unisex'];

  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // debounce search 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const ctrl = new AbortController();
    const gender = activeFilter === 'Semua' ? undefined : activeFilter;
    const params = { page: currentPage, per_page: pageSize, q: debouncedSearch || undefined, gender };
    setLoading(true);
    fetchProducts(params, { signal: ctrl.signal })
      .then((res) => {
        // Laravel paginate shape: {data:[], current_page, last_page, total, per_page, links,...}
        const list = res.data ?? res;
        if (Array.isArray(list)) {
          // fallback shape if api returns {data:[]}
          setData(list);
          setMeta({ current_page: currentPage, last_page: 1, total: list.length, links: [] });
        } else {
          // res is paginated object
          const rows = res.data ?? [];
          setData(rows);
          setMeta({
            current_page: res.current_page ?? currentPage,
            last_page: res.last_page ?? 1,
            total: res.total ?? rows.length,
            links: res.links ?? [],
          });
        }
        setError('');
      })
      .catch((e) => {
        if (e.name === 'AbortError') return;
        setError(e.status === 429 ? 'Terlalu banyak permintaan, coba lagi nanti.' : 'Gagal memuat produk.');
        setData([]);
        setMeta({ current_page: 1, last_page: 1, total: 0, links: [] });
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, [debouncedSearch, activeFilter, currentPage]);

  const totalPages = meta.last_page || 1;

  const setFilter = (f) => {
    setActiveFilter(f);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // generate links fallback if no links from server (like static)
  const paginationLinks = useMemo(() => {
    if (meta.links && meta.links.length) return meta.links;
    if (totalPages <= 1) return [];
    return Array.from({ length: totalPages }, (_, i) => {
      const p = i + 1;
      return { url: p === currentPage ? null : '#', label: String(p), active: p === currentPage };
    });
  }, [meta.links, totalPages, currentPage]);

  const handlePageClick = (page) => {
    if (page < 1 || page > totalPages) return;
    // if we have real links, we could use router, but for API we just set page
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="pt-[80px] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <div className="mb-10">
          <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-[#aaa] mb-2">Perfu.me</p>
          <h1 className="font-sans text-[28px] font-semibold text-[#1a1a1a] tracking-tight leading-tight">Koleksi Parfum</h1>
          <p className="font-sans text-[13px] text-[#888] mt-2">Signature dan inspired scent pilihan — wangi berkarakter, harga terjangkau.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6 sm:mb-8">
          <SearchInput value={search} onChange={handleSearch} placeholder="Cari produk..." />
          <div className="flex items-center gap-2 flex-wrap">
            {filters.map((f) => (
              <button key={f} type="button" onClick={() => setFilter(f)} className={`font-sans text-[10px] uppercase tracking-[0.14em] px-4 py-2 rounded-full border transition-colors duration-200 cursor-pointer ${activeFilter === f ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'bg-white text-[#888] border-[#e6e6e6] hover:border-[#1a1a1a] hover:text-[#1a1a1a]'}`}>{f}</button>
            ))}
          </div>
        </div>

        {error && !loading && <p className="font-sans text-[13px] text-red-500 py-4 text-center">{error}</p>}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : (
          <>
            {data.length === 0 && !error && <p className="font-sans text-[13px] text-[#aaa] py-16 text-center">Tidak ada produk yang cocok.</p>}

            {data.length > 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {data.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
                <button
                  type="button"
                  onClick={() => handlePageClick(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="font-sans text-[10px] uppercase tracking-[0.12em] px-4 py-2 rounded-full border border-[#e6e6e6] text-[#888] hover:border-[#1a1a1a] hover:text-[#1a1a1a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
                >
                  ← Sebelumnya
                </button>
                {(paginationLinks.length ? paginationLinks : Array.from({ length: totalPages }).map((_, i) => ({ label: String(i + 1), active: i + 1 === currentPage, url: '#' }))).map((link, idx) => {
                  const label = link.label.replace(/&[^;]+;/g, '').trim();
                  const isActive = link.active;
                  const pageNum = Number(label);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (!isNaN(pageNum)) handlePageClick(pageNum);
                        else if (label === 'Prev' || label.includes('Previous')) handlePageClick(currentPage - 1);
                        else if (label === 'Next' || label.includes('Next')) handlePageClick(currentPage + 1);
                      }}
                      className={`font-sans text-[10px] w-8 h-8 rounded-full border transition-colors duration-200 cursor-pointer ${isActive ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'bg-white text-[#888] border-[#e6e6e6] hover:border-[#1a1a1a]'}`}
                      disabled={!link.url && !isActive && isNaN(pageNum)}
                    >
                      {label}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => handlePageClick(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="font-sans text-[10px] uppercase tracking-[0.12em] px-4 py-2 rounded-full border border-[#e6e6e6] text-[#888] hover:border-[#1a1a1a] hover:text-[#1a1a1a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
                >
                  Berikutnya →
                </button>
              </div>
            )}
            {totalPages <= 1 && data.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <span className="font-sans text-[11px] text-[#888]">{data.length} produk · Hal 1 dari 1</span>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
