# Perfu.me — React Migration

Migrated from vanilla HTML + Alpine.js + Tailwind CDN to **React 19 + Vite + Tailwind CSS + React Router**.

**Same UI, same style, zero visual changes** — only codebase refactored into reusable, professional components.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build -> dist/
npm run preview  # preview build
```

Static assets live in `public/assets/` (also mirrored in `assets/` for legacy).

## Routes

| Path | Page | Source |
|------|------|--------|
| `/` | Home (hero + products + brand story + testimonials + trust badges) | `src/pages/HomePage.jsx` |
| `/products` | Product listing with search, filter, pagination | `src/pages/ProductsPage.jsx` |
| `/product/:slug` | Product detail (gallery, options, qty, reviews, recommendations) | `src/pages/ProductDetailPage.jsx` |
| `/cart` | Cart timeline step 1 + order summary | `src/pages/CartPage.jsx` |
| `/cart/alamat` | Address form step 2 + summary + map pin | `src/pages/AddressPage.jsx` |
| Legacy `product-detail.html?slug=xxx` and `cart-alamat.html` | Redirect handled via query fallback | |

## Reusable Component Inventory

### Layout
- `src/components/layout/Navbar.jsx` — logo, desktop/mobile nav, cart badge (`useCart()`), hamburger
- `src/components/layout/Footer.jsx` — brand + social, navigasi, informasi, kontak bottom bar
- `src/components/layout/FloatingActions.jsx` — WhatsApp CTA + scroll-to-top (appears at >300px)
- `src/components/layout/CheckoutStepper.jsx` — three-step timeline (Keranjang → Alamat → Pembayaran), reuses circles/lines

### UI Primitives (design-language consistent)
- `src/components/ui/Button.jsx` — variants `primary`/`secondary`/`outline`/`ghost`/`pill`, sizes `sm`/`md`/`pill`/`icon`
- `src/components/ui/Badge.jsx` — `Badge`, `Pill` (category/gender pills)
- `src/components/ui/Typography.jsx` — `Eyebrow`, `Heading`, `Body`, `Price`, `SectionLabel`
- `src/components/ui/Input.jsx` — `Input`, `TextArea` (label + error), `SearchInput` (with magnifier)
- `src/components/ui/Select.jsx` — `Select` (native styled dropdown with chevron) + `ChoiceGroup` (pill buttons for ukuran)
- `src/components/ui/QuantityControl.jsx` — `QuantityControl` (+/-) extracted from product-detail & cart; aliases `QuantityStepper`
- `src/components/ui/Table.jsx` — generic admin table (header/body/empty) for future dashboard
- `src/components/ui/Icons.jsx` — `IconCart`, `IconStar`, etc.
- `src/lib/format.js` — `formatPrice()` (`Rp` + `id-ID`), `cn()`

### Product
- `src/components/product/ProductCard.jsx` — image hover swap, badge, clamp-2 description, CTA
- `src/components/product/ProductGallery.jsx` — main image, prev/next, thumbnail rail (`useState` current)
- `src/components/product/StarRating.jsx` — 5-star fill based on value
- `src/components/product/ReviewList.jsx` — collapsible (3 → all) reviews + rating

### Cart / Checkout
- `src/components/cart/OrderSummary.jsx` — subtotal, ongkir gratis, total, item list, action button

### Form
- `src/components/form/Combobox.jsx` — searchable autocomplete dropdown (for Provinsi/Kota), matches `cart-alamat.html` region combobox

### Feedback (new, matches design language)
- `src/context/ToastContext.jsx` — provider + viewport (dark pill for success, white/red for error, 3s auto-dismiss). Use `const { toast } = useToast(); toast.success(msg)` matches Perfu.me black/white language.
- `src/components/feedback/ConfirmDialog.jsx` — modal with overlay, title/message, cancel + confirm (default `#1a1a1a`), ESC to close. Used for cart item removal.

## State

- `src/context/CartContext.jsx` — localStorage key `perfu.me:cart`, syncs via `perfu:cart` CustomEvent + `storage` event. Exposes `cart`, `cartCount`, `subtotal`, `addItem`, `removeItem`, `updateQty`.
- `src/context/ToastContext.jsx` — toast queue.
- `src/data/products.js` — single source of truth for products/testimonials/badges.

## Design Tokens

- Fonts: `Manrope` (sans) via Google Fonts, `Zaloga` (serif) via `/assets/Zaloga.ttf`
- Colors: `#1a1a1a` primary, `#111` footer/CTA, `#888` muted, `#e6e6e6` border, `#f5f5f5` chip bg, `#25D366` WhatsApp
- Preserved classes 1:1 — inspect any component, className strings match original HTML

## Migration Notes

- Alpine.js `x-data` → React `useState`/`useMemo`/`useEffect`
- `localStorage["perfu.me:cart"]` and `perfu:cart` event kept for backwards compat
- Legacy `product-detail.html?slug=` supported via `URLSearchParams` fallback
- Original HTML files remain in place (except root `index.html` now Vite entry). Original `index.html` content can be found in git history.
