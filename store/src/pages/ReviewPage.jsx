import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Check } from 'lucide-react';
import { CheckoutStepper } from '../components/layout/CheckoutStepper';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../lib/format';

const TAX_RATE = 0.11;
const SHIPPING_COST = 0;

function DummyTurnstile({ verified, onVerify }) {
  const [checked, setChecked] = useState(verified);

  useEffect(() => setChecked(verified), [verified]);

  function handleChange(e) {
    const v = e.target.checked;
    setChecked(v);
    // simulate async verification like real turnstile
    setTimeout(() => onVerify(v ? 'dummy-cloudflare-token-' + Date.now() : null), 400);
  }

  return (
    <div className="border border-[#e6e6e6] rounded-lg bg-[#fafafa] px-4 py-3 flex items-center justify-between gap-4">
      <label className="flex items-center gap-3 cursor-pointer select-none flex-1">
        <span className="relative flex items-center justify-center">
          <input
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            className="peer sr-only"
            aria-label="Verifikasi captcha"
          />
          <span className="w-[22px] h-[22px] rounded-[4px] border border-[#c9c9c9] bg-white flex items-center justify-center transition-colors duration-200 peer-checked:bg-[#1a1a1a] peer-checked:border-[#1a1a1a] peer-checked:text-white">
            {checked && <Check size={14} strokeWidth={2.5} className="text-white" />}
          </span>
        </span>
        <span className="font-sans text-[12px] text-[#333]">Saya bukan robot</span>
      </label>
      <div className="flex flex-col items-center gap-0.5 shrink-0">
        <span className="font-sans text-[9px] font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">Cloudflare</span>
        <span className="font-sans text-[8px] tracking-[0.12em] uppercase text-[#aaa]">Turnstile</span>
        <ShieldCheck size={18} className="text-[#aaa] mt-0.5" strokeWidth={1.5} />
      </div>
    </div>
  );
}

export function ReviewPage() {
  const { cart, subtotal } = useCart();
  const { toast } = useToast();
  const [captchaToken, setCaptchaToken] = useState(null);
  const [address, setAddress] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('perfu.me:address');
      if (raw) setAddress(JSON.parse(raw));
    } catch {
      setAddress(null);
    }
  }, []);

  const tax = useMemo(() => Math.round(subtotal * TAX_RATE), [subtotal]);
  const total = useMemo(() => subtotal + SHIPPING_COST + tax, [subtotal, tax]);

  const isCaptchaVerified = !!captchaToken;
  const isEmpty = cart.length === 0;

  function handlePay() {
    if (isEmpty) {
      toast.error('Keranjang kosong');
      return;
    }
    if (!isCaptchaVerified) {
      toast.error('Mohon verifikasi captcha terlebih dahulu');
      return;
    }
    // dummy: belum terhubung ke payment gateway
    toast.info('Pembayaran belum tersedia — dummy token: ' + captchaToken);
  }

  return (
    <main className="pt-[100px] max-w-[80rem] mx-auto px-8 pb-16">
      <CheckoutStepper step={3} />

      <div className="max-w-3xl mx-auto w-full">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-[11px] font-medium tracking-[0.18em] uppercase text-[#888] font-sans">Review Pesanan</h2>
          <Link to="/cart/alamat" className="inline-flex items-center gap-1.5 border-none bg-transparent p-0 font-sans text-[10px] uppercase tracking-[0.12em] text-[#888] hover:text-[#111] transition-colors no-underline">
            <ArrowLeft size={13} strokeWidth={2} />
            Kembali ke Alamat
          </Link>
        </div>

        {isEmpty ? (
          <div className="text-center py-16 border border-dashed border-[#e6e6e6] rounded-2xl bg-white">
            <p className="text-sm text-[#888] font-sans mb-4">Keranjang Anda kosong.</p>
            <Link to="/products" className="inline-block px-6 py-3 bg-[#111] text-white text-[11px] font-medium uppercase tracking-[0.12em] rounded font-sans no-underline hover:bg-[#333] transition-colors duration-200">Belanja Sekarang</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Produk — read-only, tanpa QuantityControl */}
            <section className="bg-white border border-[#e6e6e6] rounded-2xl p-6">
              <h3 className="font-sans text-[11px] font-semibold tracking-[0.14em] uppercase text-[#1a1a1a] mb-5">Produk</h3>
              <div className="flex flex-col">
                {cart.map((item, idx) => (
                  <div key={item.id + '-' + JSON.stringify(item.selectedOptions)} className={`flex gap-4 py-4 ${idx !== 0 ? 'border-t border-black/5' : ''} ${idx === 0 ? 'pt-0' : ''}`}>
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg bg-[#f7f7f7] shrink-0" />
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-sans text-[13px] font-medium text-[#111]">{item.name}</span>
                        <span className="font-sans text-[12px] font-medium text-[#111] shrink-0">{formatPrice(item.price * item.qty)}</span>
                      </div>
                      {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(item.selectedOptions).map(([k, v]) => (
                            <span key={k} className="inline-flex items-center font-sans text-[9px] tracking-[0.04em] text-[#666] bg-[#f2f2f2] rounded-full px-2 py-0.5">{k}: {v}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-1">
                        <span className="font-sans text-[11px] text-[#888]">{formatPrice(item.price)} × {item.qty}</span>
                        <span className="font-sans text-[11px] text-[#bbb]">—</span>
                        <span className="font-sans text-[11px] text-[#888]">Qty {item.qty}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Alamat ringkas jika ada */}
            {address && (
              <section className="bg-white border border-[#e6e6e6] rounded-2xl p-6">
                <h3 className="font-sans text-[11px] font-semibold tracking-[0.14em] uppercase text-[#1a1a1a] mb-4">Alamat Pengiriman</h3>
                <div className="flex flex-col gap-1">
                  <p className="font-sans text-[13px] font-medium text-[#111]">{address.fullName} · {address.phone}</p>
                  <p className="font-sans text-[12px] text-[#666] leading-relaxed">
                    {address.street}{address.detail ? `, ${address.detail}` : ''}<br />
                    {address.village ? address.village + ', ' : ''}{address.district ? address.district + ', ' : ''}{address.city_name || address.city}{address.province_name ? `, ${address.province_name}` : ''}{address.postalCode ? ` ${address.postalCode}` : ''}
                  </p>
                  {address.email && <p className="font-sans text-[11px] text-[#888]">{address.email}</p>}
                </div>
                <Link to="/cart/alamat" className="inline-block mt-3 font-sans text-[10px] uppercase tracking-[0.12em] text-[#888] hover:text-[#111] underline underline-offset-4 transition-colors">Ubah alamat</Link>
              </section>
            )}

            {/* Rincian biaya */}
            <section className="bg-white border border-[#e6e6e6] rounded-2xl p-6">
              <h3 className="font-sans text-[11px] font-semibold tracking-[0.14em] uppercase text-[#1a1a1a] mb-5">Rincian Biaya</h3>
              <div className="flex flex-col gap-3 font-sans text-[12px]">
                <div className="flex items-center justify-between text-[#666]">
                  <span>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} item)</span>
                  <span className="font-medium text-[#111]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-[#666]">
                  <span>Ongkos Kirim</span>
                  <span className="font-medium text-green-600">Gratis</span>
                </div>
                <div className="flex items-center justify-between text-[#666]">
                  <span>Pajak (PPN 11%)</span>
                  <span className="font-medium text-[#111]">{formatPrice(tax)}</span>
                </div>
                <div className="border-t border-black/5 pt-3 flex items-center justify-between">
                  <span className="font-sans text-[13px] font-semibold text-[#111]">Total</span>
                  <span className="font-sans text-[18px] font-semibold text-[#111]">{formatPrice(total)}</span>
                </div>
                <p className="font-sans text-[10px] leading-relaxed text-[#aaa]">Harga sudah termasuk pajak. Ongkos kirim gratis untuk semua pesanan.</p>
              </div>
            </section>

            {/* Captcha dummy Cloudflare */}
            <section className="bg-white border border-[#e6e6e6] rounded-2xl p-6">
              <h3 className="font-sans text-[11px] font-semibold tracking-[0.14em] uppercase text-[#1a1a1a] mb-2">Verifikasi</h3>
              <p className="font-sans text-[11px] text-[#888] mb-4">Centang untuk melanjutkan pembayaran. (Dummy Cloudflare Turnstile — token disimpan lokal)</p>
              <DummyTurnstile verified={isCaptchaVerified} onVerify={setCaptchaToken} />
              {isCaptchaVerified && <p className="font-sans text-[10px] text-green-600 mt-2 flex items-center gap-1"><Check size={12} strokeWidth={2.5} /> Terverifikasi — token: <span className="font-mono text-[#888] truncate max-w-[180px]">{captchaToken}</span></p>}
            </section>

            {/* Action Bayar */}
            <button
              type="button"
              onClick={handlePay}
              disabled={!isCaptchaVerified || isEmpty}
              className="w-full px-6 py-3.5 bg-[#111] text-white text-[11px] font-medium uppercase tracking-[0.12em] rounded font-sans cursor-pointer border-none hover:bg-[#333] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#111]"
            >
              Bayar — {formatPrice(total)}
            </button>
            <p className="font-sans text-[10px] text-center text-[#aaa] leading-relaxed">Dengan menekan Bayar, Anda menyetujui Syarat & Ketentuan Perfu.me. Tombol belum memproses pembayaran nyata.</p>
          </div>
        )}
      </div>
    </main>
  );
}
