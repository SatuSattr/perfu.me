import { useMemo, useState } from 'react';
import { products } from '../data/products';
import { ProductCard } from '../components/product/ProductCard';
import { SearchInput } from '../components/ui/Input';

export function ProductsPage() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const filters = ['Semua', 'Pria', 'Wanita', 'Unisex'];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchGender = activeFilter === 'Semua' || p.gender === activeFilter;
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.tagline.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      return matchGender && matchSearch;
    });
  }, [search, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const filteredPaged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const setFilter = (f) => { setActiveFilter(f); setCurrentPage(1); };

  // Reset to page 1 when search changes (like Shopee/Tokopedia)
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
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
              <button key={f} type="button" onClick={()=> setFilter(f)} className={`font-sans text-[10px] uppercase tracking-[0.14em] px-4 py-2 rounded-full border transition-colors duration-200 cursor-pointer ${activeFilter===f ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'bg-white text-[#888] border-[#e6e6e6] hover:border-[#1a1a1a] hover:text-[#1a1a1a]'}`}>{f}</button>
            ))}
          </div>
        </div>

        {filteredPaged.length === 0 && <p className="font-sans text-[13px] text-[#aaa] py-16 text-center">Tidak ada produk yang cocok.</p>}

        {filteredPaged.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {filteredPaged.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button type="button" onClick={()=> setCurrentPage((p)=> Math.max(1,p-1))} disabled={currentPage===1} className="font-sans text-[10px] uppercase tracking-[0.12em] px-4 py-2 rounded-full border border-[#e6e6e6] text-[#888] hover:border-[#1a1a1a] hover:text-[#1a1a1a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer">← Sebelumnya</button>
            {Array.from({length: totalPages}).map((_, i)=> {
              const p=i+1;
              return <button key={p} type="button" onClick={()=> setCurrentPage(p)} className={`font-sans text-[10px] w-8 h-8 rounded-full border transition-colors duration-200 cursor-pointer ${currentPage===p ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'bg-white text-[#888] border-[#e6e6e6] hover:border-[#1a1a1a]'}`}>{p}</button>
            })}
            <button type="button" onClick={()=> setCurrentPage((p)=> Math.min(totalPages,p+1))} disabled={currentPage===totalPages} className="font-sans text-[10px] uppercase tracking-[0.12em] px-4 py-2 rounded-full border border-[#e6e6e6] text-[#888] hover:border-[#1a1a1a] hover:text-[#1a1a1a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer">Berikutnya →</button>
          </div>
        )}
      </div>
    </main>
  );
}
