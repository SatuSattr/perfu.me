import { Link } from 'react-router-dom';
import { InstagramIcon, TiktokIcon, WhatsappIcon } from '../ui/BrandIcon';

export function Footer({ variant='default' }) {
  // variant 'product' vs 'home' differences are minimal — keep one reusable footer with conditional tweaks
  const isHome = variant === 'home';
  return (
    <footer className={`${isHome ? 'border-t border-black/10 shadow-[0_-1px_3px_rgba(0,0,0,0.04)] bg-white mt-10' : 'bg-[#fafafa] border-t border-black/[0.06] mt-16'}`}>
      <div className="max-w-7xl mx-auto px-8 py-14">
        <div className={`grid grid-cols-1 gap-10 mb-12 ${isHome ? 'md:grid-cols-2 lg:grid-cols-4 lg:gap-8' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
          {/* Brand */}
          <div className={`${isHome ? 'flex flex-col gap-4' : 'lg:col-span-2'}`}>
            <Link to="/" className="no-underline" aria-label="Perfu.me — halaman beranda">
              <span className="font-serif text-[22px] font-normal tracking-[0.12em] text-[#111]">Perfu.me</span>
            </Link>
            <p className={`font-sans text-[12px] leading-[1.8] text-[#888] mt-3 ${isHome ? 'max-w-[200px]' : 'max-w-xs'}`}>
              Parfum signature dan inspired scent pilihan — wangi berkarakter dengan harga yang terjangkau untuk semua kalangan.
            </p>
            <div className="flex items-center gap-4 mt-5">
              <a href="https://instagram.com/perfu.mefragrance" target="_blank" rel="noopener noreferrer" aria-label="Instagram Perfu.me" className="text-[#bbb] hover:text-[#111] transition-colors duration-200">
                <InstagramIcon size={16} />
              </a>
              <a href="#" aria-label="TikTok Perfu.me" className="text-[#bbb] hover:text-[#111] transition-colors duration-200">
                <TiktokIcon size={16} />
              </a>
              <a href="https://wa.me/6281383415432" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp Perfu.me" className="text-[#bbb] hover:text-[#111] transition-colors duration-200">
                <WhatsappIcon size={16} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-[#aaa] mb-4">Navigasi</p>
            <ul className="list-none m-0 p-0 flex flex-col gap-3">
              <li><Link to="/" className="font-sans text-[12px] text-[#666] no-underline hover:text-[#111] transition-colors duration-200">Home</Link></li>
              <li><Link to="/products" className="font-sans text-[12px] text-[#666] no-underline hover:text-[#111] transition-colors duration-200">Produk</Link></li>
              <li><Link to="/cart" className="font-sans text-[12px] text-[#666] no-underline hover:text-[#111] transition-colors duration-200">Keranjang</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-[#aaa] mb-4">Informasi</p>
            <ul className="list-none m-0 p-0 flex flex-col gap-3">
              <li><a href="#" className="font-sans text-[12px] text-[#666] no-underline hover:text-[#111] transition-colors duration-200">Tentang Kami</a></li>
              <li><a href="#" className="font-sans text-[12px] text-[#666] no-underline hover:text-[#111] transition-colors duration-200">Cara Pemesanan</a></li>
              <li><a href="#" className="font-sans text-[12px] text-[#666] no-underline hover:text-[#111] transition-colors duration-200">Kebijakan Privasi</a></li>
              <li><a href="#" className="font-sans text-[12px] text-[#666] no-underline hover:text-[#111] transition-colors duration-200">Syarat &amp; Ketentuan</a></li>
            </ul>
          </div>

          {/* Extra contact col for home variant */}
          {isHome && (
            <div className="flex flex-col gap-3">
              <p className="font-sans text-[9px] uppercase tracking-[0.2em] text-[#bbb] mb-1">Kontak</p>
              <a href="https://wa.me/6281383415432" target="_blank" rel="noopener noreferrer" className="font-sans text-[12px] text-[#666] no-underline hover:text-[#1a1a1a] transition-colors duration-200">+62 813-8341-5432</a>
              <a href="https://instagram.com/perfu.mefragrance" target="_blank" rel="noopener noreferrer" className="font-sans text-[12px] text-[#666] no-underline hover:text-[#1a1a1a] transition-colors duration-200">@perfu.mefragrance</a>
              <p className="font-sans text-[11.5px] text-[#aaa] leading-[1.7]">Senin – Sabtu<br/>09.00 – 21.00 WIB</p>
            </div>
          )}
        </div>

        <div className="border-t border-black/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-sans text-[11px] text-[#bbb]">&copy; 2026 Perfu.me. Semua hak dilindungi.</p>
          <p className="font-sans text-[11px] text-[#bbb]">Made with care in Indonesia.</p>
        </div>
      </div>
    </footer>
  );
}
