# Pedoman Pengembangan Store — Perfu.me

Dokumen ini adalah **guidelines wajib** untuk AI maupun developer yang mengerjakan `store/` (frontend e-commerce Perfu.me). Tujuannya menjaga UI/UX tetap konsisten, reusable, dan profesional sesuai design language yang sudah ada.

> **Prinsip #1:** Selalu utamakan komponen yang sudah ada. Jangan duplikasi markup. Jika butuh variasi, buat komponen baru sebagai **reusable component** dengan `className` yang customizable.

---

## 1. Design Language — Jangan Diubah Tanpa Persetujuan

### Warna
Gunakan **hanya** token berikut (Tailwind arbitrary atau class). Jangan menambah warna baru tanpa alasan kuat:

- **Primary text / CTA:** `#1a1a1a` (`bg-[#1a1a1a]` `text-[#1a1a1a]` `border-[#1a1a1a]`) — tombol utama, navbar active, footer icon
- **Deep black:** `#111` (`bg-[#111]` `text-[#111]`) — total price, cart badge, stepwise active
- **Muted:** `#888` (text sekunder, label), `#aaa` (eyebrow, placeholder), `#bbb` (icon disabled, social)
- **Border:** `#e6e6e6` (`border-[#e6e6e6]`), `#f5f5f5` (`bg-[#f5f5f5]` chip/badge), `#f7f7f7` (`bg-[#f7f7f7]` card image), `#fafafa` (`bg-[#fafafa]` footer)
- **Aksen:** `bg-[#25D366]` WhatsApp, `text-amber-400` star, `text-red-500` / `border-red-400` error, `text-green-600` Gratis, `rgba(0,0,0,0.04-0.08)` shadow
- **Putih:** `bg-white` / `text-white` — CTA hero di atas image gelap

Hover selalu `transition-colors duration-200`, contoh: `hover:bg-[#333]`, `hover:border-[#1a1a1a]`, `hover:bg-[#f5f5f5]`.

### Tipografi
- **Font:** `font-sans` = `Manrope` (Google Fonts, weight 400/500/600), `font-serif` = `Zaloga` (local `assets/Zaloga.ttf`, hanya untuk logo `Perfu.me` `text-[26px] tracking-[0.12em]`)
- **Skala:** 
  - Eyebrow: `text-[9px] uppercase tracking-[0.2em] text-[#aaa]`
  - Label: `text-[10px] uppercase tracking-[0.18em] text-[#aaa]` atau `text-[#888]`
  - Button CTA: `text-[10px] uppercase tracking-[0.15em] font-medium` (hero), `text-[11px] tracking-[0.12em]` (add to cart)
  - Body: `text-[12.5px] leading-[1.7-1.9] text-[#666]` / `text-[#555]`
  - Heading: `text-[18px] font-semibold text-[#1a1a1a]`, `text-[28px] tracking-tight`
- **Tracking:** Gunakan `tracking-[0.12em]` / `[0.15em]` / `[0.18em]` sesuai komponen asli, jangan pakai `tracking-wide` bawaan.

### Spacing & Radius
- Card: `rounded-2xl` (`rounded-xl` di mobile), `border border-[#e6e6e6]`, hover `hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]`
- Button: `rounded` (default), `rounded-full` untuk pill, `px-6 py-2.5` (CTA), `px-4 py-2` (pill)
- Section: `max-w-7xl mx-auto px-4 sm:px-8`, gap `gap-6` / `gap-3 sm:gap-6`
- Image card: `h-40 sm:h-56 lg:h-64`, inner `h-28 sm:h-40 lg:h-52`

### Ikon
- **Non-brand:** WAJIB `lucide-react` — `import { ShoppingCart, Search, Star, ChevronDown, Plus, Minus, X, Check, ArrowLeft, MapPin, Package, Gift, Tag, TrendingUp, Truck } from 'lucide-react'`
- **Brand:** WAJIB `simple-icons` via `src/components/ui/BrandIcon.jsx` — `InstagramIcon`, `TiktokIcon`, `WhatsappIcon` (`<BrandIcon icon={siInstagram} />`)
- **Dilarang:** `iconPaths` string + `dangerouslySetInnerHTML` (sudah dihapus di `HomePage.jsx:6`), inline `<svg>` hardcode baru. Jika butuh ikon baru, tambah mapping di `BrandIcon.jsx` atau pakai lucide.

### Lain
- Scrollbar tipis 6px `src/index.css:8` (`scrollbar-width: thin`, `::-webkit-scrollbar {width:6px}`) — jangan ubah.
- Marquee: `animation: marquee 60s linear infinite` di `src/index.css:30`.

---

## 2. Inventaris Komponen Reusable — WAJIB Dipakai Duluan

Cek `src/components/` sebelum bikin baru. Semua komponen sudah matching design language 1:1 dari HTML lama.

**UI Primitive `src/components/ui/`:**
- `Button.jsx` — `variant: primary | secondary | outline | ghost | pill | pill-active`, `size: sm | md | pill | icon | icon-sm`, prop `className` untuk override
- `CtaButton.jsx` — `CtaButton` (single) & `CtaButtonGroup` (dua CTA). Full token dinamis: `background`, `color`, `outline`, `fontSize`, `fontWeight`, `tracking`, `hover`, `className`. Alias `HeroActions` masih ada untuk compat.
- `Badge.jsx` — `Badge`, `Pill` (`text-[9px] uppercase tracking-[0.12em]`)
- `Typography.jsx` — `Eyebrow`, `Heading`, `Body`, `Price`
- `Input.jsx` — `Input`, `TextArea`, `SearchInput` (pakai `Search` lucide)
- `Select.jsx` — `Select` (chevron `ChevronDown`) & `ChoiceGroup` (pill opsi ukuran)
- `QuantityControl.jsx` — `QuantityControl` / `QuantityStepper` (pakai `Minus` `Plus` lucide, `size: default | sm`)
- `Table.jsx` — `Table` admin generic (`columns`, `data`)
- `BrandIcon.jsx` — `InstagramIcon`, `TiktokIcon`, `WhatsappIcon`
- `Icons.jsx` — wrapper legacy (`IconCart` dll) kini pakai lucide di dalamnya

**Layout `src/components/layout/`:**
- `Navbar.jsx` — logo Zaloga, cart badge `useCart()`, hamburger
- `Footer.jsx` — brand + social (BrandIcon), 4 kolom
- `FloatingActions.jsx` — WhatsApp + `ChevronUp` scrollToTop via `useLenis`/`window.scrollTo`
- `CheckoutStepper.jsx` — 3 langkah `Check` lucide

**Product `src/components/product/`:**
- `ProductCard.jsx` — hover swap hanya jika `hoverImage !== image` (`hasHover`), responsive `grid-cols-2 lg:grid-cols-3`, `hidden sm:block` untuk deskripsi
- `ProductGallery.jsx` — `ChevronLeft`/`ChevronRight`, thumbnail
- `StarRating.jsx` — `Star` lucide `fill="currentColor"`
- `ReviewList.jsx` — judul `Ulasan Pelanggan ({reviews.length})`, collapse 3→all

**Form/Cart/Feedback:**
- `Combobox.jsx` — searchable provinsi/kota (`ChevronDown`)
- `OrderSummary.jsx` — subtotal/gratis/total
- `Toast` (`context/ToastContext.jsx` — `Check`/`CircleAlert`) & `ConfirmDialog.jsx`

**Context/Hook:**
- `CartContext.jsx` — `localStorage['perfu.me:cart']`, `cartCount`, `addItem` dll, sync `perfu:cart` event
- `data/products.js` — single source `products`, `testimonials`, `badges`

Jika butuh komponen tidak ada di daftar, cek dulu apakah bisa disusun dari kombinasi di atas.

---

## 3. Aturan Penggunaan Komponen

1. **Pakai, jangan copy-paste.** Contoh: butuh tombol? `import { Button } from '@/components/ui/Button'` atau `CtaButton`. Butuh quantity? `QuantityControl`. Jangan tulis `<button class="w-9 h-9 ..."><svg>...</svg></button>` lagi.
2. **Props `className` adalah escape hatch.** Semua komponen UI menerima `className` untuk override tanpa mengubah base. Contoh: `<Badge className="text-[7px] sm:text-[9px]">`.
3. **Jangan hardcode warna/font baru.** Jika butuh varian, tambah `variant` di komponen, bukan bikin class random di page.
4. **Icons:** Selalu `lucide-react` atau `BrandIcon`. Contoh: `import { ArrowLeft } from 'lucide-react'; <ArrowLeft size={13} strokeWidth={2} />`
5. **Responsive:** Card sudah `grid-cols-2 lg:grid-cols-3`, `hidden sm:block` untuk teks panjang. Ikuti pola itu untuk halaman baru.

---

## 4. Aturan Membuat Komponen Baru

Jika memang belum ada dan tidak bisa dikomposisi:

1. **Buat file di lokasi yang benar:** `src/components/ui/` untuk primitive, `src/components/product/` untuk product, `src/components/layout/` untuk layout, `src/components/form/` untuk form. Jangan taruh di `pages/`.
2. **Wajib reusable & customizable:**
   ```jsx
   export function MyCard({ title, children, className = '', ...props }) {
     const base = 'bg-white border border-[#e6e6e6] rounded-2xl p-4 font-sans';
     return <div className={`${base} ${className}`} {...props}>{children}</div>;
   }
   ```
   - `className` harus digabung di akhir (`${base} ${className}`) agar bisa override.
   - Terima `...props` untuk `onClick`, `aria-*` dll.
   - Jangan hardcode `width`/`margin` yang mengunci layout page; biarkan page yang atur.
3. **Ikuti token design language** (warna, tracking, rounded, transition) dari bagian 1.
4. **Gunakan lucide/simple-icons** untuk ikon di dalam komponen baru.
5. **Tambahkan ke inventaris** (update bagian 2 di dokumen ini) agar AI selanjutnya tahu.

Contoh bad vs good:
- Bad: `function NewBtn(){ return <button className="bg-blue-500 text-white px-3">Click</button> }` (warna baru, tidak reusable, tanpa className)
- Good: `function NewBtn({ variant='primary', className='', ...props }){ const map={primary:'bg-[#1a1a1a] text-white ...'}; return <button className={`${map[variant]} ${className}`} {...props} /> }`

---

## 5. UI/UX Konsistensi

- **Tidak mengubah UI di mata client** tanpa diminta. Refactor hanya struktur, class harus tetap 1:1.
- **Hover & transition** selalu `duration-200`, jangan `duration-500` kecuali gallery.
- **Bahasa:** UI text Indonesia (`Jelajahi Koleksi`, `Tambah ke Keranjang`, `Tersedia 18`).
- **Aksesibilitas:** Selalu `aria-label` untuk icon button, `alt` untuk image, `aria-current="page"` untuk nav.
- **Mobile-first:** Pastikan `grid-cols-2` untuk listing, `px-4 sm:px-8`, font mengecil di mobile (`text-[13px] sm:text-[0.95rem]`). Test di 360px.

---

## 6. Workflow untuk AI

1. **Baca `GUIDELINES.md` ini dulu** sebelum edit.
2. **Audit `src/components/`** — cari komponen yang bisa dipakai. Jika ragu, tanya atau cek `store/README.md`.
3. **Jika bikin baru:** ikuti template reusable + `className` customizable, pakai lucide, taruh di folder yang benar.
4. **Verifikasi:** `npm run build` di `store/` harus sukses. Cek visual tidak berubah (kecuali diminta).
5. **Jangan:** menambah dependency ikon baru selain lucide/simple-icons, mengubah `index.css` scrollbar/marquee, atau mengubah `tailwind.config.cjs` font tanpa approval.

---

## 7. Contoh Implementasi

**CTA di section baru (light background, tetap konsisten):**
```jsx
import { CtaButtonGroup } from '@/components/ui/CtaButton';
<CtaButtonGroup
  primaryLabel="Lihat Koleksi"
  primaryBackground="bg-[#1a1a1a]" primaryColor="text-white" primaryOutline="border border-[#1a1a1a]" primaryHover="hover:bg-[#333]"
  secondaryBackground="bg-transparent" secondaryColor="text-[#1a1a1a]" secondaryOutline="border border-[#1a1a1a]" secondaryHover="hover:bg-[#1a1a1a] hover:text-white"
/>
```

**Quantity + stok (detail produk):**
```jsx
import { QuantityControl } from '@/components/ui/QuantityControl';
<div className="flex items-center gap-4">
  <QuantityControl value={qty} onDecrease={...} onIncrease={...} />
  {availableStock !== null && <span className="font-sans text-[12px] text-[#888]">Tersedia {availableStock}</span>}
</div>
```

---

*Last updated: 2026-08-31 — Jaga konsistensi, utamakan reusable, dan hormati design language Perfu.me.*
