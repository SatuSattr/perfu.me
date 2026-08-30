export function Input({ label, error, id, className='', ...props }) {
  const inputId = id || `input-${label?.replace(/\s+/g,'-').toLowerCase()}`;
  return (
    <div className="flex flex-col">
      {label && (
        <label htmlFor={inputId} className="font-sans text-[10px] font-medium tracking-[0.12em] uppercase text-[#888] mb-2 block">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full border rounded-lg px-4 py-3 text-[13px] font-sans text-[#111] outline-none focus:border-[#111] transition-colors duration-200 bg-white placeholder:text-[#bbb] ${error ? 'border-red-400' : 'border-gray-200'} ${className}`}
        {...props}
      />
      {error && <span className="mt-1.5 font-sans text-[11px] text-red-500">{error}</span>}
    </div>
  );
}

export function TextArea({ label, error, id, className='', ...props }) {
  const inputId = id || `ta-${label?.replace(/\s+/g,'-').toLowerCase()}`;
  return (
    <div className="flex flex-col">
      {label && <label htmlFor={inputId} className="font-sans text-[10px] font-medium tracking-[0.12em] uppercase text-[#888] mb-2 block">{label}</label>}
      <textarea id={inputId} className={`w-full border rounded-lg px-4 py-3 text-[13px] font-sans text-[#111] outline-none focus:border-[#111] transition-colors duration-200 bg-white placeholder:text-[#bbb] resize-none ${error ? 'border-red-400' : 'border-gray-200'} ${className}`} {...props} />
      {error && <span className="mt-1.5 font-sans text-[11px] text-red-500">{error}</span>}
    </div>
  );
}

import { Search } from 'lucide-react';

export function SearchInput({ value, onChange, placeholder='Cari produk...', ...props }) {
  return (
    <div className="relative flex-1 max-w-sm">
      <Search size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bbb] pointer-events-none" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full font-sans text-[12px] text-[#1a1a1a] bg-white border border-[#e6e6e6] rounded-full pl-9 pr-4 py-2 outline-none focus:border-[#1a1a1a] transition-colors duration-200 placeholder:text-[#bbb]"
        {...props}
      />
    </div>
  );
}
