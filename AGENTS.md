# Perfu.me Development Guidelines — Store & Admin

This document is **mandatory** for any AI or developer working on `store/` (customer e-commerce) **and** `admin/` (Laravel + Inertia dashboard). Its purpose is to keep UI/UX consistent, reusable, and professional across both frontends.

> **Principle #1:** Always prioritize existing components. Do not duplicate markup. If you need a variation, create a new component as a **reusable component** with a customizable `className`.

Scope: `store/src/**/*` (React + Vite) and `admin/resources/js/**/*` (React + Inertia + Vite Plus). The same design language applies to both.

---

## 1. Design Language — Do Not Change Without Approval

### Colors
Use **only** the following tokens (Tailwind arbitrary or class). Do not introduce new colors without strong justification:

- **Primary text / CTA:** `#1a1a1a` (`bg-[#1a1a1a]` `text-[#1a1a1a]` `border-[#1a1a1a]`) — main button, navbar active, footer icon
- **Deep black:** `#111` (`bg-[#111]` `text-[#111]`) — total price, cart badge, stepper active
- **Muted:** `#888` (secondary text, label), `#aaa` (eyebrow, placeholder), `#bbb` (disabled icon, social)
- **Border:** `#e6e6e6` (`border-[#e6e6e6]`), `#f5f5f5` (`bg-[#f5f5f5]` chip/badge), `#f7f7f7` (`bg-[#f7f7f7]` card image), `#fafafa` (`bg-[#fafafa]` footer)
- **Accent:** `bg-[#25D366]` WhatsApp, `text-amber-400` star, `text-red-500` / `border-red-400` error, `text-green-600` Gratis, `rgba(0,0,0,0.04-0.08)` shadow
- **White:** `bg-white` / `text-white` — hero CTA on dark image

Hover must always be `transition-colors duration-200`, e.g.: `hover:bg-[#333]`, `hover:border-[#1a1a1a]`, `hover:bg-[#f5f5f5]`.

### Typography
- **Font:** `font-sans` = `Manrope` (store Google Fonts) / `Instrument Sans` (admin `@theme` via `admin/resources/css/app.css:6`), `font-serif` = `Zaloga` (local `store/assets/Zaloga.ttf`, only for logo `Perfu.me` `text-[26px] tracking-[0.12em]`)
- **Scale:**
  - Eyebrow: `text-[9px] uppercase tracking-[0.2em] text-[#aaa]`
  - Label: `text-[10px] uppercase tracking-[0.18em] text-[#aaa]` or `text-[#888]`
  - CTA Button: `text-[10px] uppercase tracking-[0.15em] font-medium` (hero), `text-[11px] tracking-[0.12em]` (add to cart)
  - Body: `text-[12.5px] leading-[1.7-1.9] text-[#666]` / `text-[#555]`
  - Heading: `text-[18px] font-semibold text-[#1a1a1a]`, `text-[28px] tracking-tight`
- **Tracking:** Use `tracking-[0.12em]` / `[0.15em]` / `[0.18em]` as in original components, do not use built-in `tracking-wide`.

### Spacing & Radius
- Card: `rounded-2xl` (`rounded-xl` on mobile), `border border-[#e6e6e6]`, hover `hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]`
- Button: `rounded` (default), `rounded-full` for pill, `px-6 py-2.5` (CTA), `px-4 py-2` (pill)
- Section: `max-w-7xl mx-auto px-4 sm:px-8`, gap `gap-6` / `gap-3 sm:gap-6`
- Image card: `h-40 sm:h-56 lg:h-64`, inner `h-28 sm:h-40 lg:h-52`

### Icons
- **Non-brand:** MUST use `lucide-react` — `import { ShoppingCart, Search, Star, ChevronDown, Plus, Minus, X, Check, ArrowLeft, MapPin, Package, Gift, Tag, TrendingUp, Truck } from 'lucide-react'`
- **Brand:** MUST use `simple-icons` via `store/src/components/ui/BrandIcon.jsx` / `admin` equivalent — `InstagramIcon`, `TiktokIcon`, `WhatsappIcon` (`<BrandIcon icon={siInstagram} />`)
- **Forbidden:** `iconPaths` string + `dangerouslySetInnerHTML` (already removed in `store/src/pages/HomePage.jsx:6`), new hardcoded inline `<svg>`. If a new icon is needed, add mapping in `BrandIcon` or use lucide.

### Other
- Thin scrollbar 6px `store/src/index.css:8` (`scrollbar-width: thin`, `::-webkit-scrollbar {width:6px}`) — do not change. Admin inherits same via Tailwind base.
- Marquee: `animation: marquee 60s linear infinite` in `store/src/index.css:30`.

---

## 2. Reusable Component Inventory — MUST Use First

Check **both** `store/src/components/` and `admin/resources/js/components/` before creating anything new. All components already match the original HTML design language 1:1 and are kept in sync.

**UI Primitives — Store `store/src/components/ui/` (JSX) and Admin `admin/resources/js/components/ui/` (TSX):**
- `Button` — `variant: primary | secondary | outline | ghost | pill | pill-active`, `size: sm | md | pill | icon | icon-sm`, prop `className` (`store/src/components/ui/Button.jsx` / `admin/resources/js/components/ui/button.tsx` — uses `cn` from `store/src/lib/format.js` / `admin/resources/js/lib/utils.ts`)
- `CtaButton` — `CtaButton` (single) & `CtaButtonGroup` (two CTAs). Fully dynamic tokens: `background`, `color`, `outline`, `fontSize`, `fontWeight`, `tracking`, `hover`, `className`. Alias `HeroActions` remains for compatibility. (`store/src/components/ui/CtaButton.jsx` / `admin/resources/js/components/ui/cta-button.tsx`)
- `Badge` — `Badge`, `Pill` (`text-[9px] uppercase tracking-[0.12em]`) + `CategoryBadge` (`store/src/components/ui/Badge.jsx` / `admin/resources/js/components/ui/badge.tsx`)
- `Typography` — `Eyebrow`, `Heading`, `Body`, `Price`, `SectionLabel` (`store/src/components/ui/Typography.jsx` / `admin/resources/js/components/ui/typography.tsx`)
- `Input` — `Input`, `TextArea` (label + error + `aria-invalid`), `SearchInput` (uses `Search` lucide) (`store/src/components/ui/Input.jsx` / `admin/resources/js/components/ui/input.tsx`)
- `Select` — `Select` (chevron `ChevronDown`) & `ChoiceGroup` (pill size options) (`store/src/components/ui/Select.jsx` / `admin/resources/js/components/ui/select.tsx`)
- `QuantityControl` — `QuantityControl` / `QuantityStepper` (uses `Minus` `Plus` lucide, `size: default | sm`, `error` state) (`store/src/components/ui/QuantityControl.jsx` / `admin/resources/js/components/ui/quantity-control.tsx`)
- `Table` — generic admin `Table` (`columns`, `data`, `emptyText`) (`store/src/components/ui/Table.jsx` / `admin/resources/js/components/ui/table.tsx`)
- `BrandIcon` — `InstagramIcon`, `TiktokIcon`, `WhatsappIcon` (`store/src/components/ui/BrandIcon.jsx`)
- `Icons` — legacy wrapper (`IconCart` etc.) now internally uses lucide (`store/src/components/ui/Icons.jsx`)

**Layout — Store only (admin uses its own Inertia layout):**
- `Navbar.jsx` — Zaloga logo, cart badge `useCart()`, hamburger (`store/src/components/layout/Navbar.jsx`)
- `Footer.jsx` — brand + social (BrandIcon), 4 columns (`store/src/components/layout/Footer.jsx`)
- `FloatingActions.jsx` — WhatsApp + `ChevronUp` scrollToTop (`store/src/components/layout/FloatingActions.jsx`)
- `CheckoutStepper.jsx` — 3 steps with `Check` lucide (`store/src/components/layout/CheckoutStepper.jsx`)

**Product — Store only:**
- `ProductCard.jsx` — hover swap only if `hoverImage !== image` (`hasHover`), responsive `grid-cols-2 lg:grid-cols-3`, `hidden sm:block` for description
- `ProductGallery.jsx` — `ChevronLeft`/`ChevronRight`, thumbnails
- `StarRating.jsx` — `Star` lucide `fill="currentColor"`
- `ReviewList.jsx` — title `Ulasan Pelanggan ({reviews.length})`, collapse 3→all

**Form/Cart/Feedback — shared patterns:**
- `Combobox` — searchable province/city (`ChevronDown`, `typeable`, arrow navigation, `error`) — `store/src/components/form/Combobox.jsx` / `admin/resources/js/components/form/combobox.tsx` (uses `wilayah.id` API in `store/src/pages/AddressPage.jsx`, reuse for admin)
- `OrderSummary.jsx` — subtotal/free/total (`store/src/components/cart/OrderSummary.jsx`)
- `Toast` (`store/src/context/ToastContext.jsx` — `Check`/`CircleAlert`) & `ConfirmDialog.jsx` (`store/src/components/feedback/ConfirmDialog.jsx`)

**Context/Hook — Store:**
- `CartContext.jsx` — `localStorage['perfu.me:cart']`, `cartCount`, `addItem` etc., sync `perfu:cart` event
- `data/products.js` — single source `products`, `testimonials`, `badges` (future API → `admin`)

**Admin shared libs:**
- `admin/resources/js/lib/utils.ts` — `cn()` (`clsx` + `tailwind-merge`) — equivalent to `store/src/lib/format.js`
- `admin/resources/js/lib/format.ts` — `formatPrice()` (`Rp` + `id-ID`)

If a needed component is not in the list, check whether it can be composed from the above — do not duplicate across store/admin.

---

## 3. Component Usage Rules

1. **Use, don't copy-paste.** Need a button? `import { Button } from '@/components/ui/button'` (admin) or `@/components/ui/Button` (store) or `CtaButton`. Need quantity? `QuantityControl`. Do not write `<button class="w-9 h-9 ..."><svg>...</svg></button>` again.
2. **`className` is the escape hatch.** All UI components accept `className` to override without changing the base. Example: `<Badge className="text-[7px] sm:text-[9px]">`.
3. **Do not hardcode new colors/fonts.** If a variant is needed, add a `variant` to the component instead of creating a random class in the page.
4. **Icons:** Always `lucide-react` or `BrandIcon`. Example: `import { ArrowLeft } from 'lucide-react'; <ArrowLeft size={13} strokeWidth={2} />`
5. **Responsive:** Cards are already `grid-cols-2 lg:grid-cols-3`, `hidden sm:block` for long text. Follow that pattern for new pages.
6. **Sync store ↔ admin:** When adding a new primitive, port it to the other project (JSX ↔ TSX) using the same tokens so both frontends stay visually identical.

---

## 4. Rules for Creating New Components

If it truly does not exist and cannot be composed:

1. **Create file in the correct location:**
   - Store: `store/src/components/ui/` for primitives, `store/src/components/product/` for product, `store/src/components/layout/` for layout, `store/src/components/form/` for forms. Do not place in `pages/`.
   - Admin: `admin/resources/js/components/ui/` for primitives, `admin/resources/js/components/form/` for forms, `admin/resources/js/components/layout/` for layout. Do not place in `pages/`.
   - Keep both in sync when the component is shared (e.g., `Button`, `Input`, `Combobox`, `Table`).
2. **Must be reusable & customizable:**
   ```jsx
   export function MyCard({ title, children, className = '', ...props }) {
     const base = 'bg-white border border-[#e6e6e6] rounded-2xl p-4 font-sans';
     return <div className={`${base} ${className}`} {...props}>{children}</div>;
   }
   ```
   - `className` must be merged at the end (`${base} ${className}`) so it can override. In admin use `cn()` from `@/lib/utils`.
   - Accept `...props` for `onClick`, `aria-*` etc.
   - Do not hardcode `width`/`margin` that locks page layout; let the page control it.
3. **Follow design language tokens** (colors, tracking, rounded, transition) from Section 1.
4. **Use lucide/simple-icons** for icons inside new components.
5. **Add to inventory** (update Section 2 in this document) so future AI will know about it — list both store and admin paths.

Bad vs good example:
- Bad: `function NewBtn(){ return <button className="bg-blue-500 text-white px-3">Click</button> }` (new color, not reusable, no className)
- Good: `function NewBtn({ variant='primary', className='', ...props }){ const map={primary:'bg-[#1a1a1a] text-white ...'}; return <button className={`${map[variant]} ${className}`} {...props} /> }`

---

## 5. UI/UX Consistency

- **Do not change UI in the client's eyes** unless requested. Refactor only structure, classes must stay 1:1.
- **Hover & transition** always `duration-200`, not `duration-500` except gallery.
- **Language:** UI text is Indonesian (`Jelajahi Koleksi`, `Tambah ke Keranjang`, `Tersedia 18`).
- **Accessibility:** Always `aria-label` for icon buttons, `alt` for images, `aria-current="page"` for nav, `aria-invalid` + `role="alert"` for errors (see `Input`/`Combobox`/`QuantityControl`).
- **No extra decoration:** Do not add irrelevant labels/eyebrows (e.g. `ADMIN PANEL` under logo on login) — only add text that has functional purpose. Keep auth pages minimal (logo + heading + form).
- **No redundant helper text:** Never add mini explanations for things that are already obvious from the UI. Field labels (`*` for required), input placeholders, and section headings are self-explanatory. Do not add sentences like “— simpan dulu sebelum foto terlihat di store” or “Editable · tampil di store sebagai testimonial”. Only add helper text when it prevents a real user error (e.g. format, limits, or non-obvious side effects). Waste of words = unprofessional UX.
- **Mobile-first:** Ensure `grid-cols-2` for listings, `px-4 sm:px-8`, font shrinks on mobile (`text-[13px] sm:text-[0.95rem]`). Test at 360px.

---

## 6. Workflow for AI

1. **Read this `AGENTS.md` (root) first** before editing store or admin. For Laravel-specific rules also read `admin/AGENTS.md` (Laravel Boost).
2. **Audit `store/src/components/` and `admin/resources/js/components/`** — find a reusable component. If unsure, check `store/README.md` / `admin/README.md`.
3. **If creating new:** follow reusable + `className` customizable template, use lucide, place in correct folder for store and/or admin, keep sync.
4. **Verify:** `npm run build` in `store/` **and** `admin/` must succeed. Check that visuals haven't changed (unless requested).
5. **Do not:** add new icon dependencies besides lucide/simple-icons, change `store/src/index.css` scrollbar/marquee, or change `admin/resources/css/app.css` `@theme` / `tailwind.config` fonts without approval.

---

## 7. Implementation Examples

**CTA in a new section (light background, still consistent) — works in both projects:**
```jsx
import { CtaButtonGroup } from '@/components/ui/cta-button'; // admin: @/components/ui/cta-button, store: @/components/ui/CtaButton
<CtaButtonGroup
  primaryLabel="Lihat Koleksi"
  primaryBackground="bg-[#1a1a1a]" primaryColor="text-white" primaryOutline="border border-[#1a1a1a]" primaryHover="hover:bg-[#333]"
  secondaryBackground="bg-transparent" secondaryColor="text-[#1a1a1a]" secondaryOutline="border border-[#1a1a1a]" secondaryHover="hover:bg-[#1a1a1a] hover:text-white"
/>
```

**Quantity + stock (product detail / admin stock edit):**
```jsx
import { QuantityControl } from '@/components/ui/quantity-control'; // or '@/components/ui/QuantityControl' in store
<div className="flex items-center gap-4">
  <QuantityControl value={qty} onDecrease={...} onIncrease={...} error={qtyError} />
  {availableStock !== null && <span className="font-sans text-[12px] text-[#888]">Tersedia {availableStock}</span>}
</div>
```

**Admin Table:**
```tsx
import { Table } from '@/components/ui/table';
<Table columns={[{key:'name', header:'PRODUK'}, {key:'stock', header:'STOK'}]} data={products} />
```

---

*Last updated: 2026-08-31 — Keep consistency across store & admin, prioritize reusability, and respect Perfu.me's design language.*
