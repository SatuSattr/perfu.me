import { Minus, Plus } from "lucide-react";

// Reusable quantity control — extracted from product-detail.html and cart.html
export function QuantityControl({
  value,
  onDecrease,
  onIncrease,
  size = "default",
  className = "",
}) {
  const btnClass =
    size === "sm"
      ? "bg-none border border-black/10 rounded p-[3px] text-[#888] hover:border-[#111] hover:text-[#111]"
      : "w-9 h-9 rounded-lg border border-[#e6e6e6] text-[#555] hover:border-[#1a1a1a]";
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={onDecrease}
        aria-label="Kurangi jumlah"
        className={`flex items-center justify-center cursor-pointer transition-colors duration-200 ${btnClass}`}
      >
        <Minus size={13} strokeWidth={1.5} />
      </button>
      <span className="font-sans text-[13px] font-medium text-[#1a1a1a] min-w-[12px] text-center">
        {value}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        aria-label="Tambah jumlah"
        className={`flex items-center justify-center cursor-pointer transition-colors duration-200 ${btnClass}`}
      >
        <Plus size={13} strokeWidth={1.5} />
      </button>
    </div>
  );
}

// Product-detail styled variant alias
export function QuantityStepper({ value, onChange, min = 1 }) {
  return (
    <QuantityControl
      value={value}
      onDecrease={() => onChange(Math.max(min, value - 1))}
      onIncrease={() => onChange(value + 1)}
    />
  );
}
