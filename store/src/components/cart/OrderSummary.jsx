import { formatPrice } from '../../lib/format';

export function OrderSummary({ subtotal, items, actionLabel, onAction, disabled }) {
  return (
    <div className="w-full lg:w-[340px] shrink-0">
      <div className="border border-black/[0.08] rounded p-6">
        <h3 className="text-[11px] font-medium tracking-[0.18em] uppercase text-[#111] mb-5 font-sans">Ringkasan Pesanan</h3>
        <div className="flex flex-col gap-2 text-[12px] font-sans mb-4">
          <div className="flex items-center justify-between text-[#666]"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
          <div className="flex items-center justify-between text-[#666]"><span>Ongkos Kirim</span><span className="text-green-600">Gratis</span></div>
          <div className="border-t border-black/5 pt-3 flex items-center justify-between font-medium">
            <span className="text-[#111]">Total</span>
            <span className="text-[15px] font-semibold text-[#111]">{formatPrice(subtotal)}</span>
          </div>
        </div>

        {items && items.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-black/5 pt-4 mt-4">
            {items.map((item) => (
              <div key={item.id + JSON.stringify(item.selectedOptions)} className="flex gap-3 items-center">
                <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-[12px] font-medium text-[#111]">{item.name}</p>
                  {item.selectedOptions && Object.keys(item.selectedOptions).length>0 && <p className="font-sans text-[10px] text-[#888]">{Object.values(item.selectedOptions).join(', ')}</p>}
                  <p className="font-sans text-[11px] text-[#888]">x{item.qty} — {formatPrice(item.price * item.qty)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {actionLabel && (
          <button type="button" onClick={onAction} disabled={disabled} className="w-full mt-4 px-6 py-3 bg-[#111] text-white text-[11px] font-medium uppercase tracking-[0.12em] rounded font-sans cursor-pointer border-none hover:bg-[#333] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
