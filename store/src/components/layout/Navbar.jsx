import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';

function NavLink({ to, children, active }) {
  return (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      className={`relative font-sans text-[10px] font-medium tracking-[0.18em] uppercase no-underline transition-colors duration-200 ${active ? 'text-[#111]' : 'text-[#888] hover:text-[#111]'}`}
    >
      {children}
    </Link>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cartCount } = useCart();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white border-b border-black/10 shadow-[0_1px_3px_rgba(0,0,0,0.04)] mx-4">
      <nav className="mx-auto max-w-7xl flex items-center justify-between lg:grid lg:grid-cols-[1fr_auto_1fr] h-[60px]" aria-label="Navigasi utama">
        <ul className="hidden lg:flex items-center gap-8 list-none m-0 p-0">
          <li><NavLink to="/" active={isActive('/')}>Home</NavLink></li>
          <li><NavLink to="/products" active={isActive('/products')}>Produk</NavLink></li>
        </ul>

        <Link to="/" className="flex justify-center no-underline" aria-label="Perfu.me — halaman beranda">
          <span className="font-serif text-[26px] font-normal tracking-[0.12em] text-[#111]">Perfu.me</span>
        </Link>

        <div className="flex items-center gap-5 justify-end">
          <Link
            to="/cart"
            className="bg-none border-none cursor-pointer text-[#888] p-1 flex items-center justify-center transition-colors duration-200 relative no-underline hover:text-[#111]"
            aria-label="Keranjang belanja"
          >
            <ShoppingCart size={18} strokeWidth={1.5} className="w-[18px] h-[18px]" />
            <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#111] text-white text-[9px] font-medium items-center justify-center font-sans ${cartCount > 0 ? 'flex' : 'hidden'}`}>
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          </Link>

          <button type="button" aria-label="Buka menu" className="lg:hidden flex flex-col gap-[5px] p-1 bg-none border-none cursor-pointer" onClick={() => setMobileOpen((v) => !v)}>
            <span className="w-5 h-px bg-[#111] transition-all duration-200 block" />
            <span className="w-5 h-px bg-[#111] transition-all duration-200 block" />
            <span className="w-5 h-px bg-[#111] transition-all duration-200 block" />
          </button>
        </div>
      </nav>

      <nav className={`fixed inset-x-0 top-[60px] bottom-0 bg-white z-40 px-8 py-8 border-t border-black/5 flex-col overflow-y-auto ${mobileOpen ? 'flex' : 'hidden'}`} aria-label="Menu mobile">
        <Link to="/" className={`font-sans text-[11px] font-medium tracking-[0.18em] uppercase no-underline py-4 border-b border-black/5 block transition-colors duration-200 ${isActive('/') ? 'text-[#111]' : 'text-[#888] hover:text-[#111]'}`} onClick={() => setMobileOpen(false)} aria-current={isActive('/')?'page':undefined}>Home</Link>
        <Link to="/products" className={`font-sans text-[11px] font-medium tracking-[0.18em] uppercase no-underline py-4 border-b border-black/5 block transition-colors duration-200 ${isActive('/products') ? 'text-[#111]' : 'text-[#888] hover:text-[#111]'}`} onClick={() => setMobileOpen(false)}>Produk</Link>
      </nav>
    </header>
  );
}
