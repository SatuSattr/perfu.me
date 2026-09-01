import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { CheckoutStepper } from '../components/layout/CheckoutStepper';
import { OrderSummary } from '../components/cart/OrderSummary';
import { QuantityControl } from '../components/ui/QuantityControl';
import { ConfirmDialog } from '../components/feedback/ConfirmDialog';
import { useToast } from '../context/ToastContext';
import { resolveImage } from '../lib/api';

export function CartPage() {
  const { cart, subtotal, removeItem, updateQty } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [confirmTarget, setConfirmTarget] = useState(null);

  return (
    <main className="pt-[100px] max-w-[80rem] mx-auto px-8 pb-16">
      <CheckoutStepper step={1} />

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="flex-1 min-w-0">
          <h2 className="text-[11px] font-medium tracking-[0.18em] uppercase text-[#888] mb-6 font-sans">Pesanan Anda ({cart.length})</h2>

          {cart.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-[#888] font-sans mb-4">Keranjang Anda kosong.</p>
              <Link to="/products" className="inline-block px-6 py-3 bg-[#111] text-white text-[11px] font-medium uppercase tracking-[0.12em] rounded font-sans no-underline hover:bg-[#333] transition-colors duration-200">Belanja Sekarang</Link>
            </div>
          ) : (
            <div>
              {cart.map((item, index) => (
                <div key={item.id + '-' + JSON.stringify(item.selectedOptions)} className={`flex gap-4 pb-5 mb-5 ${index < cart.length - 1 ? 'border-b border-black/5' : ''}`}>
                  <img src={resolveImage(item.image)} alt={item.name} className="w-20 h-20 object-cover rounded shrink-0 bg-[#f7f7f7]" style={{ width: 80, height: 80 }} />
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[13px] font-medium text-[#111] font-sans">{item.name}</span>
                      <button type="button" onClick={() => setConfirmTarget(item)} className="bg-none border-none cursor-pointer text-[#bbb] p-0.5 flex transition-colors duration-200 hover:text-[#888] shrink-0" aria-label="Hapus item">
                        <X size={14} strokeWidth={1.5} />
                      </button>
                    </div>

                    {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(item.selectedOptions).map(([k,v])=> (
                          <span key={k} className="inline-flex items-center font-sans text-[9px] tracking-[0.04em] text-[#666] bg-[#f2f2f2] rounded-full px-2 py-0.5">{k}: {v}</span>
                        ))}
                      </div>
                    )}

                    <span className="text-[12px] text-[#888] font-sans">{'Rp ' + (item.price * item.qty).toLocaleString('id-ID')}</span>

                    {/* Reusable QuantityControl in sm size */}
                    <QuantityControl size="sm" value={item.qty} onDecrease={()=> updateQty(item, item.qty -1)} onIncrease={()=> updateQty(item, item.qty +1)} className="mt-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <OrderSummary subtotal={subtotal} actionLabel="Lanjut ke Alamat" disabled={cart.length===0} onAction={()=> { if(cart.length>0) navigate('/cart/alamat'); else toast.error('Keranjang kosong'); }} />
      </div>

      <ConfirmDialog
        open={!!confirmTarget}
        title="Hapus item?"
        message={confirmTarget ? `Hapus ${confirmTarget.name} dari keranjang?` : ''}
        confirmText="Hapus"
        cancelText="Batal"
        onCancel={()=> setConfirmTarget(null)}
        onConfirm={()=> { if(confirmTarget){ removeItem(confirmTarget); toast.info(`${confirmTarget.name} dihapus`); setConfirmTarget(null);} }}
      />
    </main>
  );
}
