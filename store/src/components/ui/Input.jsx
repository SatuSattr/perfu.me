export function Input({ label, error, id, className='', ...props }) {
  const inputId = id || (label ? `input-${label.replace(/\s+/g,'-').toLowerCase()}` : undefined);
  const errorId = error && inputId ? `${inputId}-error` : undefined;
  return (
    <div className="flex flex-col">
      {label && (
        <label htmlFor={inputId} className="font-sans text-[10px] font-medium tracking-[0.12em] uppercase text-[#888] mb-2 block">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={errorId}
        className={`w-full border rounded-lg px-4 py-3 text-[13px] font-sans text-[#111] outline-none transition-colors duration-200 bg-white placeholder:text-[#bbb] ${error ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-[#111]'} ${className}`}
        {...props}
      />
      {error && <span id={errorId} className="mt-1.5 font-sans text-[11px] text-red-500" role="alert">{error}</span>}
    </div>
  );
}

export function TextArea({ label, error, id, className='', ...props }) {
  const inputId = id || (label ? `ta-${label.replace(/\s+/g,'-').toLowerCase()}` : undefined);
  const errorId = error && inputId ? `${inputId}-error` : undefined;
  return (
    <div className="flex flex-col">
      {label && <label htmlFor={inputId} className="font-sans text-[10px] font-medium tracking-[0.12em] uppercase text-[#888] mb-2 block">{label}</label>}
      <textarea id={inputId} aria-invalid={!!error} aria-describedby={errorId} className={`w-full border rounded-lg px-4 py-3 text-[13px] font-sans text-[#111] outline-none transition-colors duration-200 bg-white placeholder:text-[#bbb] resize-none ${error ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-[#111]'} ${className}`} {...props} />
      {error && <span id={errorId} className="mt-1.5 font-sans text-[11px] text-red-500" role="alert">{error}</span>}
    </div>
  );
}

import { Search } from 'lucide-react';

export function SearchInput({ value, onChange, placeholder='Cari produk...', error, id, ...props }) {
  const inputId = id || 'search-input';
  const errorId = error && inputId ? `${inputId}-error` : undefined;
  return (
    <div className="flex flex-col flex-1 max-w-sm">
      <div className="relative flex-1">
        <Search size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bbb] pointer-events-none" />
        <input
          id={inputId}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={`w-full font-sans text-[12px] text-[#1a1a1a] bg-white border rounded-full pl-9 pr-4 py-2 outline-none transition-colors duration-200 placeholder:text-[#bbb] ${error ? 'border-red-400 focus:border-red-400' : 'border-[#e6e6e6] focus:border-[#1a1a1a]'}`}
          {...props}
        />
      </div>
      {error && <span id={errorId} className="mt-1.5 font-sans text-[11px] text-red-500" role="alert">{error}</span>}
    </div>
  );
}
