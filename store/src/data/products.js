// Shared product data — mirrors the original HTML allProducts
export const products = [
  {
    id: 1,
    slug: "dynamyst",
    name: "Dynamyst",
    tagline: "Fresh. Bold. Confident.",
    description:
      "Aroma fresh, sporty, dan clean dengan sentuhan hangat yang memberikan kesan maskulin, energik, dan percaya diri. Cocok digunakan untuk aktivitas sehari-hari.",
    gender: "Pria",
    price: 45000,
    stock: 30,
    category: "EDP",
    type: "signature",
    image: "/assets/products/dynamyst-transparent.png",
    detailImage: "/assets/products/dynamyst-detail.png",
    images: [
      "/assets/products/dynamyst-transparent.png",
      "/assets/products/dynamyst-detail.png",
    ],
    sizeLabel: null,
    options: [],
    reviews: [
      {
        name: "Rafi A.",
        rating: 5,
        date: "18 Aug 2026",
        message: "Aromanya fresh banget, tahan lama juga. Udah beli 3 kali!",
      },
      {
        name: "Budi S.",
        rating: 4,
        date: "10 Aug 2026",
        message: "Packaging rapi, aroma sesuai deskripsi. Akan repeat order.",
      },
      {
        name: "Arif W.",
        rating: 5,
        date: "08 Aug 2026",
        message:
          "Sudah coba banyak parfum lokal, ini yang paling nempel di kulit. Recommended!",
      },
      {
        name: "Fajar N.",
        rating: 4,
        date: "01 Aug 2026",
        message: "Fresh tapi ada sentuhan woody yang bikin makin keren. Suka!",
      },
      {
        name: "Bagas P.",
        rating: 5,
        date: "31 Jul 2026",
        message:
          "Cocok banget buat sehari-hari. Banyak yang nanya pakai parfum apa.",
      },
    ],
  },
  {
    id: 2,
    slug: "vannessence",
    name: "Vannessence",
    tagline: "Soft. Warm. Timeless.",
    description:
      "Aroma vanilla yang lembut, creamy, dan elegan dengan nuansa hangat yang menenangkan. Cocok untuk penggunaan sehari-hari maupun momen spesial.",
    gender: "Wanita",
    price: 45000,
    stock: 25,
    category: "EDP",
    type: "signature",
    image: "/assets/products/vennesence-transparent.png",
    detailImage: "/assets/products/vennesence-detail.png",
    images: [
      "/assets/products/vennesence-transparent.png",
      "/assets/products/vennesence-detail.png",
    ],
    sizeLabel: null,
    options: [],
    reviews: [
      {
        name: "Dewi L.",
        rating: 4,
        date: "19 Aug 2026",
        message: "Soft dan menenangkan, cocok banget dipakai malam hari.",
      },
      {
        name: "Ayu R.",
        rating: 5,
        date: "06 Aug 2026",
        message:
          "Tahan lebih dari 8 jam di kulit saya. Luar biasa buat harga segini.",
      },
      {
        name: "Rizka A.",
        rating: 5,
        date: "04 Aug 2026",
        message:
          "Creamy vanilla yang bikin nagih. Temen-temen langsung tanya ini parfum apa.",
      },
      {
        name: "Cindy H.",
        rating: 5,
        date: "21 Jul 2026",
        message:
          "Beli karena rekomendasi teman, nggak nyesel sama sekali. Wanginya feminin dan elegan.",
      },
    ],
  },
  {
    id: 3,
    slug: "inspired-scent",
    name: "Inspired Scent",
    tagline: "Wangi kelas dunia, harga terjangkau.",
    description:
      "Lebih dari 40 pilihan aroma terinspirasi dari parfum-parfum mewah kelas dunia. Karakter yang sama, harga yang jauh lebih bersahabat.",
    gender: "Unisex",
    price: 20000,
    stock: null,
    category: "EDP",
    type: "inspired",
    image: "/assets/products/refill-transparent.png",
    images: ["/assets/products/refill-transparent.png"],
    sizeLabel: "15ml, 35ml, 50ml",
    options: [
      {
        id: "aroma",
        name: "aroma",
        label: "Pilih Aroma",
        mode: "dropdown",
        required: true,
        position: 0,
        choices: [
          {
            id: "creed-aventus",
            name: "Creed Aventus",
            price: null,
            stock: 18,
          },
          {
            id: "baccarat-rouge-540",
            name: "Baccarat Rouge 540",
            price: null,
            stock: 12,
          },
          {
            id: "ysl-black-opium",
            name: "YSL Black Opium",
            price: null,
            stock: 20,
          },
          { id: "dior-sauvage", name: "Dior Sauvage", price: null, stock: 25 },
          { id: "versace-eros", name: "Versace Eros", price: null, stock: 15 },
          {
            id: "miss-dior-blooming",
            name: "Miss Dior Blooming Bouquet",
            price: null,
            stock: 0,
          },
          {
            id: "chanel-chance",
            name: "Chanel Chance",
            price: null,
            stock: 10,
          },
          {
            id: "tom-ford-black-orchid",
            name: "Tom Ford Black Orchid",
            price: null,
            stock: 8,
          },
          {
            id: "armani-acqua-di-gio",
            name: "Armani Acqua di Gio",
            price: null,
            stock: 22,
          },
          {
            id: "jo-malone-peony-blush",
            name: "Jo Malone Peony & Blush Suede",
            price: null,
            stock: 6,
          },
        ],
      },
      {
        id: "ukuran",
        name: "ukuran",
        label: "Pilih Ukuran",
        mode: "normal",
        required: true,
        position: 1,
        choices: [
          { id: "15ml", name: "15ml", price: 20000, stock: 50 },
          { id: "35ml", name: "35ml", price: 35000, stock: 30 },
          { id: "50ml", name: "50ml", price: 50000, stock: 15 },
        ],
      },
    ],
    reviews: [
      {
        name: "Tono P.",
        rating: 5,
        date: "26 Aug 2026",
        message:
          "Ambil varian Creed Aventus, persis banget baunya. Highly recommended!",
      },
      {
        name: "Andi S.",
        rating: 5,
        date: "12 Aug 2026",
        message: "Mirip banget sama yang ori! Harga terjangkau kualitas oke.",
      },
      {
        name: "Fitri D.",
        rating: 4,
        date: "26 Jul 2026",
        message: "Packaging bagus, aroma akurat. Pengiriman cepat juga.",
      },
    ],
  },
];

export function getProductBySlug(slug) {
  return products.find((p) => p.slug === slug) || products[0];
}

export const testimonials = [
  {
    name: "Tono P.",
    product: "Inspired Scent",
    date: "26 Aug 2026",
    quote:
      "Ambil varian Creed Aventus, persis banget baunya. Highly recommended!",
    rating: 5,
  },
  {
    name: "Dewi L.",
    product: "Vannessence",
    date: "19 Aug 2026",
    quote: "Soft dan menenangkan, cocok banget dipakai malam hari.",
    rating: 4,
  },
  {
    name: "Rafi A.",
    product: "Dynamyst",
    date: "18 Aug 2026",
    quote: "Aromanya fresh banget, tahan lama juga. Udah beli 3 kali!",
    rating: 5,
  },
  {
    name: "Andi S.",
    product: "Inspired Scent",
    date: "12 Aug 2026",
    quote: "Mirip banget sama yang ori! Harga terjangkau kualitas oke.",
    rating: 5,
  },
  {
    name: "Budi S.",
    product: "Dynamyst",
    date: "10 Aug 2026",
    quote: "Packaging rapi, aroma sesuai deskripsi. Akan repeat order.",
    rating: 4,
  },
  {
    name: "Arif W.",
    product: "Dynamyst",
    date: "08 Aug 2026",
    quote:
      "Sudah coba banyak parfum lokal, ini yang paling nempel di kulit. Recommended!",
    rating: 5,
  },
  {
    name: "Ayu R.",
    product: "Vannessence",
    date: "06 Aug 2026",
    quote:
      "Tahan lebih dari 8 jam di kulit saya. Luar biasa buat harga segini.",
    rating: 5,
  },
  {
    name: "Rizka A.",
    product: "Vannessence",
    date: "04 Aug 2026",
    quote:
      "Creamy vanilla yang bikin nagih. Temen-temen langsung tanya ini parfum apa.",
    rating: 5,
  },
  {
    name: "Fajar N.",
    product: "Dynamyst",
    date: "01 Aug 2026",
    quote: "Fresh tapi ada sentuhan woody yang bikin makin keren. Suka!",
    rating: 4,
  },
  {
    name: "Bagas P.",
    product: "Dynamyst",
    date: "31 Jul 2026",
    quote: "Cocok banget buat sehari-hari. Banyak yang nanya pakai parfum apa.",
    rating: 5,
  },
  {
    name: "Fitri D.",
    product: "Inspired Scent",
    date: "26 Jul 2026",
    quote: "Packaging bagus, aroma akurat. Pengiriman cepat juga.",
    rating: 4,
  },
  {
    name: "Cindy H.",
    product: "Vannessence",
    date: "21 Jul 2026",
    quote:
      "Beli karena rekomendasi teman, nggak nyesel sama sekali. Wanginya feminin dan elegan.",
    rating: 5,
  },
];

export const badges = [
  { icon: "package", label: "Produk Langsung Dikirim" },
  { icon: "gift", label: "Gratis Ongkir" },
  { icon: "star", label: "Inspired Scent Bervariasi" },
  { icon: "tag", label: "Harga Terjangkau" },
  { icon: "trending-up", label: "Wangi Tahan Lama" },
  { icon: "truck", label: "Tidak Melayani COD" },
  { icon: "map-pin", label: "Parfum Lokal, Buatan Indonesia" },
];
