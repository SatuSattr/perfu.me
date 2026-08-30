# Perfu.me — Monorepo

Monorepo sederhana untuk ekosistem **Perfu.me** (parfum lokal berkarakter). Repo ini memisahkan dua aplikasi utama dalam satu repository agar pengembangan, versioning, dan deployment tetap konsisten.

## Struktur Direktori

```
/
├── store/        # Frontend e-commerce (customer-facing)
└── admin/        # Backend dashboard admin (Laravel - akan datang)
```

### `/store`
Frontend toko yang diakses pelanggan. Sudah di-migrasi dari HTML + Alpine.js ke **React 19 + Vite + Tailwind CSS + React Router**.

- **Tech:** Vite, React, React Router, Tailwind CSS, lucide-react, simple-icons
- **Fitur utama:** Katalog produk, detail produk (gallery, varian aroma/ukuran, quantity control), keranjang, alamat pengiriman, toast & confirm dialog, komponen reusable (Button, Badge, ProductCard, Table untuk admin nanti)
- **Path masuk:** `store/src/main.jsx` → `store/src/App.jsx`
- **Menjalankan:**
  ```bash
  cd store
  npm install
  npm run dev      # http://localhost:5173
  npm run build    # output ke store/dist
  npm run preview
  ```
- **Assets:** `store/public/assets` (hero, brand-story, produk). `store/src/data/products.js` sebagai single source of truth.
- **Dokumentasi lengkap:** lihat `store/README.md`

### `/admin`
Tempat untuk **project Laravel** dashboard admin (manajemen produk, pesanan, stok, laporan).

> Saat ini masih kosong — hanya struktur folder. Nantinya akan diisi dengan instalasi Laravel standar (`composer create-project laravel/laravel admin`).

Placeholder sudah disiapkan:
- `admin/.gitkeep` agar folder tetap ter-track git
- Abaikan `admin/vendor`, `admin/node_modules`, `admin/.env` via root `.gitignore`

**Rencana dashboard:**
- Auth admin
- CRUD produk & varian (sinkron dengan `store/src/data/products.js` via API)
- Manajemen pesanan & alamat (dari `store/src/pages/CartPage.jsx` & `AddressPage.jsx`)
- Tabel admin menggunakan komponen `store/src/components/ui/Table.jsx`

## Monorepo Workflow

- **Root `.gitignore`** mengabaikan `store/node_modules`, `store/dist`, `admin/vendor`, `admin/node_modules`, dan file env/log.
- **Dua app terpisah** tapi berbagi satu repo: mudah untuk CI/CD dan sinkronisasi kontrak API nanti.
- **Store** tetap bisa di-deploy independen (mis. Vercel/Netlify dari folder `store`), **Admin** deploy ke server PHP/Laravel.

## Cara Mulai (Baru Clone)

```bash
git clone <repo-url>
cd Perfu.me-FE

# Store
cd store && npm install && npm run dev

# Admin (nanti)
# composer create-project laravel/laravel admin
# cd admin && cp .env.example .env && php artisan key:generate
```

## Catatan Migrasi

- File HTML lama (`cart.html`, `product-detail.html`, `products.html`, `cart-alamat.html`) sudah dihapus dari root — seluruh UI kini ada di `store/src` sebagai komponen reusable.
- Style tetap identik dengan desain awal (font Zaloga & Manrope, warna `#1a1a1a`, `#f5f5f5`, dll).

Lisensi: Internal Perfu.me
