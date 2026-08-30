import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

// Reusable searchable combobox — used for Provinsi / Kota
// Matches styling from cart-alamat.html region dropdowns
export function Combobox({ label, placeholder, value, onSelect, options = [], error, disabled }) {
  const [query, setQuery] = useState(value?.name || '');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => { setQuery(value?.name || ''); }, [value]);

  const filtered = query.trim() ? options.filter((o) => o.name.toLowerCase().includes(query.trim().toLowerCase())) : options;

  useEffect(() => {
    const onClick = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="flex flex-col" ref={containerRef}>
      {label && <label className="font-sans text-[10px] font-medium tracking-[0.12em] uppercase text-[#888] mb-2 block">{label}</label>}
      <div className="relative">
        <input
          type="text"
          placeholder={disabled ? 'Pilih sebelumnya dulu' : placeholder}
          disabled={disabled}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => !disabled && setOpen(true)}
          className={`w-full border rounded-lg px-4 py-3 pr-9 text-[13px] font-sans text-[#111] outline-none focus:border-[#111] transition-colors duration-200 bg-white placeholder:text-[#bbb] ${error ? 'border-red-400' : 'border-gray-200'} ${disabled ? 'opacity-50 cursor-not-allowed bg-[#f9f9f9]' : 'cursor-pointer'}`}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#aaa]">
          <ChevronDown size={14} strokeWidth={2} />
        </span>
        {open && !disabled && filtered.length > 0 && (
          <ul className="absolute z-30 left-0 right-0 mt-1 bg-white border border-black/12 rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.08)] max-h-[220px] overflow-auto">
            {filtered.map((o) => (
              <li key={o.code} onMouseDown={(e) => { e.preventDefault(); onSelect(o); setQuery(o.name); setOpen(false); }} className="px-4 py-2.5 text-[13px] font-sans text-[#111] hover:bg-[#f5f5f5] cursor-pointer">{o.name}</li>
            ))}
          </ul>
        )}
      </div>
      {error && <span className="mt-1.5 font-sans text-[11px] text-red-500">{error}</span>}
    </div>
  );
}
