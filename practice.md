# Panduan Perintah (Practice)

Dokumen ini menjelaskan cara memakai perintah generator halaman dan service di proyek ini. Semua perintah dijalankan dari folder root proyek (sejajar `package.json`).

## Persiapan

Pastikan file berikut sudah ada:

```
template-boilerplate/
├─ scripts/
│  ├─ make-page.mjs
│  └─ make-service.mjs
├─ src/
│  ├─ components/Sidebar.jsx
│  ├─ lib/nav.js
│  ├─ pages/
│  └─ service/
└─ package.json
```

Pastikan `package.json` memiliki script berikut:

```json
"scripts": {
  "page": "node scripts/make-page.mjs",
  "service": "node scripts/make-service.mjs"
}
```

Cek dengan `npm run`. Daftarnya harus menampilkan `page` dan `service`.

Catatan penting: tanda `--` setelah nama script wajib ada. Tanpa itu, npm menganggap `--resource` dan sejenisnya sebagai opsi npm, bukan opsi skrip.

---

## 1. Membuat Halaman: `npm run page`

Setiap folder di `src/pages` otomatis menjadi route. Folder yang punya `nav.js` otomatis muncul di sidebar.

### Halaman sederhana

```bash
npm run page -- laporan
```

Hasil:
- `src/pages/laporan/index.jsx`
- `src/pages/laporan/nav.js`
- Route: `/laporan`
- Menu "Laporan" muncul di sidebar, grup "Menu", urutan otomatis di akhir.

### Halaman dengan label, grup, dan urutan

```bash
npm run page -- laporan --label "Laporan Bulanan" --group Administrasi --order 20
```

### Menu dropdown (induk dengan submenu)

```bash
npm run page -- surat --dropdown masuk,keluar
```

Dengan label khusus untuk anak, pakai format `nama:Label` dan bungkus seluruh nilai dengan kutip:

```bash
npm run page -- surat --dropdown "masuk:Surat Masuk,keluar:Surat Keluar"
```

Hasil:
- `/surat`, `/surat/masuk`, `/surat/keluar`
- Di sidebar, "Surat" menjadi induk dengan panah buka-tutup.

### Menambah anak dropdown nanti

Induk yang sudah ada tidak ditimpa, jadi aman dijalankan berulang:

```bash
npm run page -- surat --dropdown arsip,disposisi
```

Untuk satu anak saja, cara singkatnya:

```bash
npm run page -- surat/template
```

### Menu tingkat atas walaupun berada di dalam folder

```bash
npm run page -- surat/laporan --flat
```

### Route dinamis (tanpa sidebar)

Di PowerShell, bungkus dengan kutip:

```bash
npm run page -- "surat/[id]"
```

Folder `[id]` otomatis menjadi `:id` pada route dan tidak masuk sidebar.

### Halaman tanpa menu sidebar

```bash
npm run page -- login --no-nav
```

### Daftar opsi `page`

| Opsi | Fungsi |
|---|---|
| `--label "Nama"` | Teks menu dan judul halaman (default: nama folder) |
| `--group "Grup"` | Judul seksi sidebar, hanya untuk menu tingkat atas (default: Menu) |
| `--order 10` | Urutan, angka kecil tampil lebih dulu (default: otomatis) |
| `--dropdown a,b` | Membuat anak submenu, format `nama` atau `nama:Label` |
| `--flat` | Tampil sendiri, tidak bertumpuk di bawah induk |
| `--no-nav` | Hanya membuat route, tanpa menu |

Aturan nama folder: huruf kecil, angka, `-`, dan `_`.

---

## 2. Mengatur Menu lewat `nav.js`

Semua perilaku sidebar diatur di `src/pages/<folder>/nav.js`. Contoh lengkap:

```js
export default {
  label: "Surat",          // teks menu (default: nama folder)
  group: "Administrasi",   // judul seksi, hanya untuk menu tingkat atas
  order: 10,               // urutan, angka kecil tampil lebih dulu
  defaultOpen: true,       // submenu terbuka saat pertama dimuat
  toggleOnly: false,       // true: klik induk hanya buka/tutup submenu
  flat: false,             // true: tampil sendiri, tidak bertumpuk
  hidden: false,           // true: sembunyikan dari sidebar
};
```

Tips:
- Pakai `toggleOnly: true` untuk induk yang tidak punya isi halaman sendiri.
- Pakai `hidden: true` untuk menyembunyikan menu tanpa menghapus route.
- Kalau ada kunci salah ketik, konsol browser (mode dev) akan memberi peringatan.
- Anak otomatis bertumpuk di bawah folder induk terdekat yang punya `nav.js`.

### Perilaku sidebar

- Induk otomatis terbuka kalau halaman anaknya sedang aktif.
- Induk yang anaknya aktif tampil abu-abu lembut, anak aktif tampil rose solid.
- Menekan nama induk membuka halaman induk dan submenu. Panah hanya membuka/menutup submenu.
- Saat sidebar diciutkan, menekan induk memunculkan panel kecil berisi anak-anaknya.
- Di HP, sidebar tidak menutup saat menekan induk, hanya menutup setelah memilih halaman.

---

## 3. Membuat Service API: `npm run service`

File dibuat di `src/service`. Klien axios bersama dibuat otomatis di `src/service/api.js` (sekali saja).

### Service GET saja

```bash
npm run service -- Dashboard
```

Hasil `src/service/dashboardService.js`:

```js
import api from './api';

export const getDashboards = async (params = {}) => {
  const { data } = await api.get('dashboards', { params });
  return data;
};
```

### Service CRUD lengkap

```bash
npm run service -- Asset --resource
```

Hasil `src/service/assetService.js`:

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

### Endpoint khusus

Nama endpoint otomatis dijamakkan secara sederhana (`Asset` jadi `assets`, `Category` jadi `categories`). Kalau tidak cocok dengan API Anda:

```bash
npm run service -- Asset --resource --endpoint master/assets
```

### Nama multi-kata

```bash
npm run service -- AssetCategory --resource
```

Hasil: `assetCategoryService.js` dengan endpoint `asset-categories`.

### Menimpa file yang sudah ada

Secara default file yang sudah ada tidak ditimpa. Tambahkan `--force` untuk menimpa:

```bash
npm run service -- Asset --resource --force
```

### Daftar opsi `service`

| Opsi | Fungsi |
|---|---|
| `--resource` | CRUD lengkap (tanpa opsi ini hanya GET) |
| `--endpoint path` | Menentukan path endpoint sendiri |
| `--force` | Menimpa file service yang sudah ada |

### Konfigurasi `.env`

```
VITE_API_URL=http://localhost:8000/api/
```

Pakai garis miring di akhir, karena endpoint ditulis tanpa garis miring di depan. Token otomatis diambil dari `localStorage` dengan kunci `token` dan dikirim sebagai `Authorization: Bearer ...`.

### Contoh pemakaian di komponen

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

---

## 4. Alur Kerja Contoh

Membuat modul "Surat" lengkap dengan API:

```bash
npm run page -- surat --group Administrasi --order 10 --dropdown "masuk:Surat Masuk,keluar:Surat Keluar"
npm run service -- Surat --resource
```

Lalu isi `src/pages/surat/masuk/index.jsx` dengan memakai `@/service/suratService`.

---

## 5. Pemecahan Masalah

| Masalah | Penyebab dan solusi |
|---|---|
| `Missing script: "page"` | `package.json` belum menyertakan script `page`/`service`, atau belum disimpan. Tambahkan, simpan, cek dengan `npm run`. |
| `Cannot find module ...make-page.mjs` | File skrip belum ada di `scripts/` pada root proyek (bukan di dalam `src`). |
| `--dropdown` tidak membuat anak | `make-page.mjs` masih versi lama. Ganti dengan versi terbaru. |
| Menu baru belum muncul di sidebar | Refresh browser sekali. Vite perlu memindai ulang glob. Pastikan folder punya `nav.js`. |
| Error soal `clsx` atau `tailwind-merge` | Jalankan `npm i clsx tailwind-merge` (dibutuhkan oleh `@/lib/utils`). |
| `--asset` tidak terbaca | Format `npm run service --asset` tidak bisa. Pakai `npm run service -- Asset`. |
| Tanda `[id]` bermasalah di PowerShell | Bungkus dengan kutip: `"surat/[id]"`. |
| Peringatan soal `inert` | Ganti `inert={!open}` dengan `{...(open ? {} : { inert: true })}`. |
