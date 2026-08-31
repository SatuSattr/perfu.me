# Perfu.me — Admin Dashboard

Dashboard admin untuk ekosistem **Perfu.me** (parfum lokal berkarakter). Dibangun dengan **Laravel 13 + Inertia 3 + React 19** di atas starter kit `laravel/blank-react-starter-kit`.

Monorepo: `store/` (frontend customer) + `admin/` (dashboard ini) berbagi satu repo `perfu.me`.

## Tech Stack

- **Backend:** Laravel `^13.17`, PHP `^8.3` (`admin/composer.json:14`)
- **Frontend:** `@inertiajs/react ^3.0`, `react ^19.2`, `vite ^8.0` via `vite-plus ^0.3`, `@tailwindcss/vite ^4.1`, `tailwindcss ^4.0` (`admin/package.json:14`)
- **Build/Tooling:** `laravel-vite-plugin ^3.1`, `@vitejs/plugin-react`, `@laravel/vite-plugin-wayfinder`, `laravel/boost ^2.2`, `laravel/pint ^1.27`, `larastan ^3.9`, `pest ^5.1`
- **Entry:** `resources/css/app.css` + `resources/js/app.tsx` → `resources/views/app.blade.php` (`admin/vite.config.ts:13`)
- **Routing:** `routes/web.php:5` — `Route::inertia('/', 'welcome')->name('home')`, halaman Inertia di `resources/js/pages/` (contoh `welcome.tsx`)

## Struktur Direktori

```
admin/
├── app/Http/Controllers/   # Controller (pakai Wayfinder untuk generate TS actions)
├── app/Models/             # Eloquent models (User, nanti Product/Order)
├── bootstrap/              # Laravel bootstrap
├── config/                 # inertia.php, dll
├── database/migrations/    # users, cache, jobs
├── resources/
│   ├── css/app.css         # Tailwind 4 entry
│   ├── js/
│   │   ├── app.tsx         # Inertia setup
│   │   ├── pages/welcome.tsx
│   │   ├── lib/utils.ts
│   │   └── types/
│   └── views/app.blade.php
├── routes/web.php, console.php
├── tests/                  # Pest Feature/Unit ExampleTest
├── vite.config.ts          # inertia + react + wayfinder + tailwindcss
├── composer.json / package.json
└── .env.example
```

Lihat panduan lengkap Laravel Boost di `admin/AGENTS.md`.

## Prasyarat

- PHP `^8.3`, Composer, Node 20+, MySQL/SQLite

## Cara Menjalankan

```bash
cd admin

# 1. Install deps
composer install
npm install

# 2. Env & DB
cp .env.example .env
php artisan key:generate
touch database/database.sqlite   # jika pakai SQLite
php artisan migrate

# 3. Dev (jalan 1 perintah: server + queue + logs + vite)
composer run dev
# atau manual:
# php artisan serve   # http://localhost:8000
# npm run dev         # Vite HMR via vite-plus (vp dev)

# Build prod
npm run build          # vp build
npm run build:ssr      # dengan SSR

# Check & lint
npm run check          # vp check
npm run types:check    # tsc --noEmit
composer run lint      # pint
composer run test      # pest + pint + phpstan
```

`composer.json:42` scripts: `setup`, `dev`, `lint`, `types:check`, `test`, dll.

## Pengembangan

- Buat model/controller/migration pakai `php artisan make:* --no-interaction`.
- Inertia pages di `resources/js/pages/`, routing server via `Inertia::render()` bukan Blade.
- Wayfinder: `import { home } from '@/routes'` atau `@/actions/...`.
- Validasi, Eloquent, API Resources ikuti konvensi `admin/AGENTS.md` (Laravel Boost).

## Rencana Dashboard (akan datang)

- Auth admin (starter kit sudah include)
- CRUD produk & varian (sinkron ke `store/src/data/products.js` via API)
- Manajemen pesanan & alamat (dari `store/src/pages/CartPage.jsx` & `AddressPage.jsx`)
- Tabel reusable mirip `store/src/components/ui/Table.jsx`

## Monorepo Workflow

- Root `.gitignore` mengabaikan `admin/vendor`, `admin/node_modules`, `admin/.env`, `store/dist`.
- `store/` deploy terpisah (Vercel/Netlify), `admin/` deploy ke server PHP/Laravel.

Lisensi: Internal Perfu.me
