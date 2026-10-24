# Template Boilerplate

Template aplikasi web berbasis React dan Vite dengan routing otomatis, sidebar otomatis, dan generator halaman serta service API lewat satu perintah.

Cukup buat folder di `src/pages`, maka halaman langsung punya route dan, jika diinginkan, muncul di sidebar. Tidak ada daftar route atau daftar menu yang perlu diedit manual.

## Isi

- [Teknologi](#teknologi)
- [Memulai](#memulai)
- [Struktur Proyek](#struktur-proyek)
- [Routing Otomatis](#routing-otomatis)
- [Sidebar Otomatis](#sidebar-otomatis)
- [Perintah Generator Halaman](#perintah-generator-halaman)
- [Perintah Generator Service](#perintah-generator-service)
- [Konfigurasi API](#konfigurasi-api)
- [Pemecahan Masalah](#pemecahan-masalah)

## Teknologi

- React 19 dan React Router 7
- Vite 8
- Tailwind CSS 4, shadcn, dan Base UI
- Axios untuk komunikasi API
- SweetAlert2 untuk dialog dan notifikasi
- Lucide React untuk ikon bawaan komponen

## Memulai

Syarat: Node.js versi terbaru dan npm.

```bash
npm install
```

Salin file environment lalu isi alamat API:

```bash
VITE_APP_NAME=NamaApp
VITE_API_URL=http://localhost:8000/api/
```

Jalankan server pengembangan:

```bash
npm run dev
```

Perintah lain:

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Menjalankan server pengembangan |
| `npm run build` | Membuat build produksi |
| `npm run preview` | Menjalankan hasil build secara lokal |
| `npm run lint` | Memeriksa kode dengan ESLint |
| `npm run page` | Generator halaman dan menu (lihat bagian di bawah) |
| `npm run service` | Generator service API (lihat bagian di bawah) |

Fungsi `cn` di `@/lib/utils` membutuhkan `clsx` dan `tailwind-merge`. Jika build mengeluh soal itu, jalankan `npm i clsx tailwind-merge`.

## Struktur Proyek

```
template-boilerplate/
├─ scripts/
│  ├─ make-page.mjs          generator halaman dan menu
│  └─ make-service.mjs       generator service API
├─ src/
│  ├─ components/
│  │  └─ Sidebar.jsx         sidebar, membaca menu dari nav.js
│  ├─ layout/
│  │  └─ MainLayout.jsx      kerangka halaman (sidebar + konten)
│  ├─ lib/
│  │  ├─ utils.js            fungsi cn
│  │  └─ nav.js              penyusun struktur menu dari semua nav.js
│  ├─ pages/                 setiap folder menjadi route
│  │  └─ dashboard/
│  │     ├─ index.jsx        isi halaman
│  │     └─ nav.js           pengaturan menu sidebar
│  ├─ service/
│  │  ├─ api.js              klien axios bersama
│  │  └─ *Service.js         fungsi pemanggil API per modul
│  └─ AppRoutes.jsx          routing otomatis dari src/pages
└─ package.json
```

## Routing Otomatis

`AppRoutes.jsx` memindai seluruh file `.jsx` di `src/pages` dan membuat route dari nama foldernya.

| File | Route |
|---|---|
| `src/pages/dashboard/index.jsx` | `/dashboard` |
| `src/pages/surat/index.jsx` | `/surat` |
| `src/pages/surat/masuk/index.jsx` | `/surat/masuk` |
| `src/pages/surat/[id]/index.jsx` | `/surat/:id` |

Aturan:

- Folder dengan nama dalam kurung siku, seperti `[id]`, menjadi parameter dinamis.
- File atau folder yang diawali garis bawah (`_form.jsx`) dan folder `components` di dalam `pages` tidak dijadikan route.
- Rute yang tidak dikenal dialihkan ke `/dashboard`.
- Setiap halaman dimuat secara lazy, dan error pada satu halaman ditampilkan tanpa merusak seluruh aplikasi.

Setiap halaman boleh mengekspor opsi tambahan:

```jsx
// Judul tab browser. Default diambil dari nama folder.
export const title = "Surat Masuk";

// Tampilkan tanpa MainLayout (cocok untuk halaman login).
export const layout = false;

export default function SuratMasukPage() {
  return <div>Isi halaman</div>;
}
```

Halaman wajib memakai `export default` berupa komponen.

## Sidebar Otomatis

Sidebar dibangun dari file `nav.js` di dalam folder halaman. Folder yang punya `nav.js` muncul di sidebar. Folder tanpa `nav.js` tetap punya route tetapi tidak muncul di menu.

Contoh `src/pages/surat/nav.js`:

```js
export default {
  label: "Surat",          // teks menu (default: nama folder)
  group: "Administrasi",   // judul seksi, hanya untuk menu tingkat atas
  order: 10,               // urutan, angka kecil tampil lebih dulu
  defaultOpen: false,      // submenu terbuka saat pertama dimuat
  toggleOnly: false,       // true: klik induk hanya membuka/menutup submenu
  flat: false,             // true: tampil sendiri, tidak bertumpuk di bawah induk
  hidden: false,           // true: sembunyikan dari sidebar
};
```

Aturan penumpukan: folder bersarang otomatis menjadi submenu dari folder induk terdekat yang punya `nav.js`. Misalnya `surat/masuk` dan `surat/keluar` menjadi anak dari `surat`. Gunakan `flat: true` jika ingin sebuah folder tampil sendiri di tingkat atas.

Perilaku sidebar:

- Induk otomatis terbuka jika salah satu halaman anaknya sedang aktif.
- Induk yang anaknya aktif ditandai abu-abu lembut, sedangkan halaman yang aktif ditandai warna solid.
- Menekan nama induk membuka halaman induk sekaligus submenu. Panah hanya membuka atau menutup submenu.
- `toggleOnly: true` cocok untuk induk yang tidak punya isi halaman sendiri.
- Saat sidebar diciutkan, menekan induk memunculkan panel kecil berisi anak-anaknya. Panel menutup dengan klik di luar, tombol Esc, atau pindah halaman.
- Di layar kecil, sidebar tidak menutup saat induk ditekan, dan baru menutup setelah halaman dipilih.
- Kunci yang salah ketik di `nav.js` memunculkan peringatan di konsol browser pada mode pengembangan.

Jika folder baru belum muncul setelah dibuat, muat ulang browser satu kali karena Vite perlu memindai ulang daftar file.

## Perintah Generator Halaman

Perintah `npm run page` membuat halaman, menu sidebar, dan (opsional) file service API sekaligus. Tanda `--` setelah nama script wajib ada, karena tanpa itu npm menganggap opsi sebagai miliknya sendiri.

### Mode interaktif

```bash
npm run page
```

Anda akan ditanya berurutan:

1. Nama folder, misalnya `surat` atau `surat/masuk`
2. Label menu
3. Grup sidebar
4. Tipe menu: single atau dropdown
5. Nama submenu (jika dropdown)
6. Service API: tanpa service, GET saja, atau resource (CRUD lengkap)

### Lewat argumen

Perintah paling lengkap:

```bash
npm run page -- surat --group Administrasi --dropdown "masuk:Surat Masuk,keluar:Surat Keluar" --resource
```

Contoh lain:

```bash
# Halaman dan menu saja
npm run page -- laporan

# Halaman dengan service GET saja
npm run page -- dashboard --service

# Halaman dengan service CRUD lengkap
npm run page -- asset --resource

# Menentukan endpoint API sendiri
npm run page -- asset --resource --api master/assets

# Menambah submenu ke dropdown yang sudah ada (induk tidak ditimpa)
npm run page -- surat --dropdown arsip,disposisi

# Route dinamis tanpa menu (di PowerShell, bungkus dengan kutip)
npm run page -- "surat/[id]"
```

### Daftar opsi

| Opsi | Fungsi |
|---|---|
| `--dropdown "a:Label A,b"` | Membuat menu dropdown dengan submenu. Tanpa opsi ini, menu bertipe single. |
| `--service` | Membuat service dengan fungsi GET saja |
| `--resource` | Membuat service CRUD lengkap |
| `--api path` | Menentukan endpoint API sendiri (untuk menu single) |
| `--label "Nama"` | Teks menu dan judul halaman |
| `--group "Grup"` | Judul seksi sidebar |
| `--order 10` | Urutan menu. Default: otomatis mengikuti urutan pembuatan |
| `--flat` | Tampil sendiri di tingkat atas, tidak bertumpuk |
| `--no-nav` | Hanya membuat route, tanpa menu sidebar |

### Aturan

- Nama folder hanya boleh huruf kecil, angka, `-`, dan `_` (atau `[param]` untuk route dinamis).
- Pada dropdown, service dibuat untuk setiap submenu, bukan untuk induknya. Perintah paling lengkap di atas menghasilkan `suratMasukService.js` dan `suratKeluarService.js`.
- File yang sudah ada tidak ditimpa, jadi perintah aman dijalankan berulang.
- Folder dinamis seperti `[id]` hanya membuat halaman, tanpa menu dan tanpa service.

## Perintah Generator Service

Perintah `npm run service` membuat file service di `src/service` tanpa membuat halaman.

```bash
# CRUD lengkap
npm run service -- Asset --resource

# GET saja
npm run service -- Dashboard

# Endpoint sendiri
npm run service -- Asset --resource --endpoint master/assets

# Menimpa file service yang sudah ada
npm run service -- Asset --resource --force
```

Hasil dari `npm run service -- Asset --resource` adalah `src/service/assetService.js`:

```js
import api from './api';

export const getAssets = async (params = {}) => {
  const { data } = await api.get('assets', { params });
  return data;
};
export const PostAssets = async (data) => (await api.post('assets', data)).data;
export const getAssetsById = async (id) => (await api.get(`assets/${id}`)).data;
export const UpdateAssets = async (id, data) => (await api.put(`assets/${id}`, data)).data;
export const deleteAssets = async (id) => (await api.delete(`assets/${id}`)).data;
```

Tanpa `--resource`, hanya fungsi `getAssets` yang dibuat.

Aturan penamaan:

- Nama endpoint dan fungsi dijamakkan dengan aturan sederhana bahasa Inggris (`Asset` menjadi `assets`, `Category` menjadi `categories`).
- Nama multi-kata ditulis `AssetCategory`, menghasilkan `assetCategoryService.js` dengan endpoint `asset-categories`.
- Jika endpoint API Anda berbeda, gunakan `--endpoint` pada perintah `service` atau `--api` pada perintah `page`.

Contoh pemakaian di komponen:

```jsx
import { useEffect, useState } from "react";
import { getAssets, deleteAssets } from "@/service/assetService";

export default function AssetPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    getAssets({ page: 1 }).then(setRows);
  }, []);

  const hapus = async (id) => {
    await deleteAssets(id);
    setRows((r) => r.filter((x) => x.id !== id));
  };

  return null;
}
```

## Konfigurasi API

Klien axios bersama ada di `src/service/api.js` dan dibuat otomatis oleh generator jika belum ada:

```js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

- Alamat dasar API diambil dari `VITE_API_URL` di file `.env`. Akhiri dengan garis miring, karena endpoint ditulis tanpa garis miring di depan.
- Token diambil dari `localStorage` dengan kunci `token` dan dikirim sebagai `Authorization: Bearer <token>`.
- Semua service memakai klien yang sama, sehingga perubahan seperti penanganan error global cukup dilakukan di satu tempat.

## Pemecahan Masalah

| Masalah | Penyebab dan solusi |
|---|---|
| `Missing script: "page"` | `package.json` belum memuat script `page` dan `service`, atau belum disimpan. Periksa dengan `npm run`. |
| `Cannot find module ...make-page.mjs` | File skrip belum ada di folder `scripts` pada root proyek (bukan di dalam `src`). |
| `--resource` atau `--dropdown` tidak berpengaruh | `scripts/make-page.mjs` masih versi lama. Ganti dengan versi terbaru lalu simpan. |
| Menu baru belum muncul di sidebar | Muat ulang browser satu kali. Pastikan foldernya punya `nav.js` dan tidak berisi `hidden: true`. |
| Halaman tidak ditemukan dan dialihkan ke `/dashboard` | Pastikan ada file `index.jsx` di dalam folder halaman dan berisi `export default`. |
| Error soal `clsx` atau `tailwind-merge` | Jalankan `npm i clsx tailwind-merge`. |
| Format `npm run service --asset` tidak jalan | Gunakan `--` setelah nama script: `npm run service -- Asset`. |
| Tanda `[id]` bermasalah di PowerShell | Bungkus dengan kutip: `"surat/[id]"`. |
| Peringatan soal atribut `inert` pada sidebar | Ganti `inert={!open}` dengan `{...(open ? {} : { inert: true })}`. |
