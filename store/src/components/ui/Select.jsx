import { ChevronDown } from 'lucide-react';

// Reusable Select matching product-detail dropdown style
export function Select({ label, required, error, children, placeholder='Pilih...', ...props }) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-[#555]">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          className={`w-full border rounded-lg px-4 py-3 pr-9 text-[13px] font-sans text-[#111] outline-none focus:border-[#111] transition-colors duration-200 bg-white appearance-none cursor-pointer ${error ? 'border-red-400' : 'border-gray-200'}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {children}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#aaa]">
          <ChevronDown size={14} strokeWidth={2} />
        </span>
      </div>
      {error && <span className="font-sans text-[11px] text-red-500">{error}</span>}
    </div>
  );
}

// Choice pills group (normal mode) — reusable for ukuran etc
export function ChoiceGroup({ label, required, options=[], value, onChange, error }) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-[#555]">{label} {required && <span className="text-rose-500">*</span>}</label>}
      <div className="flex flex-wrap gap-2">
        {options.map((choice) => {
          const isActive = value === choice.id;
          const isDisabled = choice.stock <= 0;
          return (
            <button
              key={choice.id}
              type="button"
              disabled={isDisabled}
              onClick={() => onChange(choice.id)}
              className={`font-sans text-[11px] px-4 py-2 rounded-lg border transition-all duration-200 cursor-pointer ${isActive ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white' : isDisabled ? 'border-[#e6e6e6] text-[#ccc] line-through cursor-not-allowed' : 'border-[#e6e6e6] text-[#555] hover:border-[#1a1a1a]'}`}
            >
              {choice.name}
              {choice.price != null && <span> — Rp {choice.price.toLocaleString('id-ID')}</span>}
            </button>
          );
        })}
      </div>
      {error && <span className="font-sans text-[11px] text-red-500">{error}</span>}
    </div>
  );
}
