# Store Development Guidelines — Perfu.me

This document is **mandatory** for any AI or developer working on `store/` (Perfu.me e-commerce frontend). Its purpose is to keep UI/UX consistent, reusable, and professional according to the existing design language.

> **Principle #1:** Always prioritize existing components. Do not duplicate markup. If you need a variation, create a new component as a **reusable component** with a customizable `className`.

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
- **Font:** `font-sans` = `Manrope` (Google Fonts, weights 400/500/600), `font-serif` = `Zaloga` (local `assets/Zaloga.ttf`, only for logo `Perfu.me` `text-[26px] tracking-[0.12em]`)
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
- **Brand:** MUST use `simple-icons` via `src/components/ui/BrandIcon.jsx` — `InstagramIcon`, `TiktokIcon`, `WhatsappIcon` (`<BrandIcon icon={siInstagram} />`)
- **Forbidden:** `iconPaths` string + `dangerouslySetInnerHTML` (already removed in `HomePage.jsx:6`), new hardcoded inline `<svg>`. If a new icon is needed, add mapping in `BrandIcon.jsx` or use lucide.

### Other
- Thin scrollbar 6px `src/index.css:8` (`scrollbar-width: thin`, `::-webkit-scrollbar {width:6px}`) — do not change.
- Marquee: `animation: marquee 60s linear infinite` in `src/index.css:30`.

---

## 2. Reusable Component Inventory — MUST Use First

Check `src/components/` before creating anything new. All components already match the original HTML design language 1:1.

**UI Primitives `src/components/ui/`:**
- `Button.jsx` — `variant: primary | secondary | outline | ghost | pill | pill-active`, `size: sm | md | pill | icon | icon-sm`, prop `className` for override
- `CtaButton.jsx` — `CtaButton` (single) & `CtaButtonGroup` (two CTAs). Fully dynamic tokens: `background`, `color`, `outline`, `fontSize`, `fontWeight`, `tracking`, `hover`, `className`. Alias `HeroActions` remains for compatibility.
- `Badge.jsx` — `Badge`, `Pill` (`text-[9px] uppercase tracking-[0.12em]`)
- `Typography.jsx` — `Eyebrow`, `Heading`, `Body`, `Price`
- `Input.jsx` — `Input`, `TextArea`, `SearchInput` (uses `Search` lucide)
- `Select.jsx` — `Select` (chevron `ChevronDown`) & `ChoiceGroup` (pill size options)
- `QuantityControl.jsx` — `QuantityControl` / `QuantityStepper` (uses `Minus` `Plus` lucide, `size: default | sm`)
- `Table.jsx` — generic admin `Table` (`columns`, `data`)
- `BrandIcon.jsx` — `InstagramIcon`, `TiktokIcon`, `WhatsappIcon`
- `Icons.jsx` — legacy wrapper (`IconCart` etc.) now internally uses lucide

**Layout `src/components/layout/`:**
- `Navbar.jsx` — Zaloga logo, cart badge `useCart()`, hamburger
- `Footer.jsx` — brand + social (BrandIcon), 4 columns
- `FloatingActions.jsx` — WhatsApp + `ChevronUp` scrollToTop
- `CheckoutStepper.jsx` — 3 steps with `Check` lucide

**Product `src/components/product/`:**
- `ProductCard.jsx` — hover swap only if `hoverImage !== image` (`hasHover`), responsive `grid-cols-2 lg:grid-cols-3`, `hidden sm:block` for description
- `ProductGallery.jsx` — `ChevronLeft`/`ChevronRight`, thumbnails
- `StarRating.jsx` — `Star` lucide `fill="currentColor"`
- `ReviewList.jsx` — title `Ulasan Pelanggan ({reviews.length})`, collapse 3→all

**Form/Cart/Feedback:**
- `Combobox.jsx` — searchable province/city (`ChevronDown`)
- `OrderSummary.jsx` — subtotal/free/total
- `Toast` (`context/ToastContext.jsx` — `Check`/`CircleAlert`) & `ConfirmDialog.jsx`

**Context/Hook:**
- `CartContext.jsx` — `localStorage['perfu.me:cart']`, `cartCount`, `addItem` etc., sync `perfu:cart` event
- `data/products.js` — single source `products`, `testimonials`, `badges`

If a needed component is not in the list, check whether it can be composed from the above.

---

## 3. Component Usage Rules

1. **Use, don't copy-paste.** Need a button? `import { Button } from '@/components/ui/Button'` or `CtaButton`. Need quantity? `QuantityControl`. Do not write `<button class="w-9 h-9 ..."><svg>...</svg></button>` again.
2. **`className` is the escape hatch.** All UI components accept `className` to override without changing the base. Example: `<Badge className="text-[7px] sm:text-[9px]">`.
3. **Do not hardcode new colors/fonts.** If a variant is needed, add a `variant` to the component instead of creating a random class in the page.
4. **Icons:** Always `lucide-react` or `BrandIcon`. Example: `import { ArrowLeft } from 'lucide-react'; <ArrowLeft size={13} strokeWidth={2} />`
5. **Responsive:** Cards are already `grid-cols-2 lg:grid-cols-3`, `hidden sm:block` for long text. Follow that pattern for new pages.

---

## 4. Rules for Creating New Components

If it truly does not exist and cannot be composed:

1. **Create file in the correct location:** `src/components/ui/` for primitives, `src/components/product/` for product, `src/components/layout/` for layout, `src/components/form/` for forms. Do not place in `pages/`.
2. **Must be reusable & customizable:**
   ```jsx
   export function MyCard({ title, children, className = '', ...props }) {
     const base = 'bg-white border border-[#e6e6e6] rounded-2xl p-4 font-sans';
     return <div className={`${base} ${className}`} {...props}>{children}</div>;
   }
   ```
   - `className` must be merged at the end (`${base} ${className}`) so it can override.
   - Accept `...props` for `onClick`, `aria-*` etc.
   - Do not hardcode `width`/`margin` that locks page layout; let the page control it.
3. **Follow design language tokens** (colors, tracking, rounded, transition) from Section 1.
4. **Use lucide/simple-icons** for icons inside new components.
5. **Add to inventory** (update Section 2 in this document) so future AI will know about it.

Bad vs good example:
- Bad: `function NewBtn(){ return <button className="bg-blue-500 text-white px-3">Click</button> }` (new color, not reusable, no className)
- Good: `function NewBtn({ variant='primary', className='', ...props }){ const map={primary:'bg-[#1a1a1a] text-white ...'}; return <button className={`${map[variant]} ${className}`} {...props} /> }`

---

## 5. UI/UX Consistency

- **Do not change UI in the client's eyes** unless requested. Refactor only structure, classes must stay 1:1.
- **Hover & transition** always `duration-200`, not `duration-500` except gallery.
- **Language:** UI text is Indonesian (`Jelajahi Koleksi`, `Tambah ke Keranjang`, `Tersedia 18`).
- **Accessibility:** Always `aria-label` for icon buttons, `alt` for images, `aria-current="page"` for nav.
- **Mobile-first:** Ensure `grid-cols-2` for listings, `px-4 sm:px-8`, font shrinks on mobile (`text-[13px] sm:text-[0.95rem]`). Test at 360px.

---

## 6. Workflow for AI

1. **Read `AGENTS.md` first** before editing.
2. **Audit `src/components/`** — find a reusable component. If unsure, check `store/README.md`.
3. **If creating new:** follow reusable + `className` customizable template, use lucide, place in correct folder.
4. **Verify:** `npm run build` in `store/` must succeed. Check that visuals haven't changed (unless requested).
5. **Do not:** add new icon dependencies besides lucide/simple-icons, change `index.css` scrollbar/marquee, or change `tailwind.config.cjs` fonts without approval.

---

## 7. Implementation Examples

**CTA in a new section (light background, still consistent):**
```jsx
import { CtaButtonGroup } from '@/components/ui/CtaButton';
<CtaButtonGroup
  primaryLabel="Lihat Koleksi"
  primaryBackground="bg-[#1a1a1a]" primaryColor="text-white" primaryOutline="border border-[#1a1a1a]" primaryHover="hover:bg-[#333]"
  secondaryBackground="bg-transparent" secondaryColor="text-[#1a1a1a]" secondaryOutline="border border-[#1a1a1a]" secondaryHover="hover:bg-[#1a1a1a] hover:text-white"
/>
```

**Quantity + stock (product detail):**
```jsx
import { QuantityControl } from '@/components/ui/QuantityControl';
<div className="flex items-center gap-4">
  <QuantityControl value={qty} onDecrease={...} onIncrease={...} />
  {availableStock !== null && <span className="font-sans text-[12px] text-[#888]">Tersedia {availableStock}</span>}
</div>
```

---

*Last updated: 2026-08-31 — Keep consistency, prioritize reusability, and respect Perfu.me's design language.*
