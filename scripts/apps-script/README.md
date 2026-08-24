# Konten Web Profile dari Google Spreadsheet

Halaman profil (`/`) membaca isinya dari sebuah Google Spreadsheet lewat Google
Apps Script. Tim bisa mengganti teks, anggota tim, publikasi, dan foto tanpa
menyentuh kode dan tanpa deploy ulang.

Alurnya:

```
Spreadsheet ──> Apps Script Web App (doGet, JSON)
                        │
                        ▼
        Server situs (src/features/profile/api/)
        • cache 5 menit  • validasi Zod  • fallback
                        │
                        ▼
                 Halaman profil (SSR)
```

Kalau spreadsheet belum dibuat atau Google sedang bermasalah, situs otomatis
memakai konten bawaan di `src/features/profile/data/fallback-content.ts`.
Halaman tidak pernah kosong.

---

## 1. Buat spreadsheet

1. Buat Google Spreadsheet baru, beri nama mis. **Blue Carbon — Konten Web**.
2. Menu **Extensions → Apps Script**.
3. Hapus isi `Code.gs` bawaan, tempel seluruh isi
   [`Code.gs`](Code.gs) dari folder ini, lalu **Save**.
4. Pilih fungsi `setupSheets` di dropdown, klik **Run**. Beri izin saat diminta.

`setupSheets` membuat seluruh sheet beserta baris header-nya sekaligus. Sheet
yang sudah ada tidak diubah, jadi aman dijalankan ulang.

## 2. Deploy sebagai Web App

1. Klik **Deploy → New deployment**.
2. Pilih tipe **Web app**.
3. Isi:
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
4. **Deploy**, lalu salin **Web app URL** (berakhiran `/exec`).

> **Who has access wajib `Anyone`.** Kalau tidak, Apps Script mengembalikan
> halaman login Google (bukan JSON) dan situs akan jatuh ke konten fallback.
> Ini hanya membuat konten profil — yang memang publik — bisa dibaca; tidak ada
> akses tulis ke spreadsheet.

## 3. Hubungkan ke situs

```bash
cp .env.example .env
```

Isi `.env`:

```
PROFILE_CONTENT_ENDPOINT=https://script.google.com/macros/s/AKfy.../exec
```

Restart dev server. Kalau berhasil, banner kuning "Konten fallback" di atas
halaman (hanya muncul saat `npm run dev`) akan hilang.

Untuk deploy produksi, set variabel yang sama di dashboard hosting
(Cloudflare Workers → Settings → Variables).

**Jangan memberi awalan `VITE_`** pada variabel ini — variabel `VITE_*` ikut
ter-bundle ke browser sehingga endpoint-nya jadi publik.

### Token opsional

Untuk menahan endpoint dari scraper:

1. Di `Code.gs`, isi `var SHARED_TOKEN = 'kata-sandi-panjang';`
2. Deploy ulang (**Deploy → Manage deployments → edit → New version**).
3. Isi nilai yang sama di `.env` pada `PROFILE_CONTENT_TOKEN`.

---

## Struktur sheet

Nama sheet harus persis seperti di bawah (huruf kecil). Header boleh ditulis
dalam bahasa Indonesia — lihat [Alias header](#alias-header).

Kolom **`order`** menentukan urutan tampil. Baris tanpa `order` diletakkan di
akhir. Baris yang seluruh selnya kosong diabaikan.

### `site` — dua kolom: nama field, isi

| Field              | Isi                                                                           |
| ------------------ | ----------------------------------------------------------------------------- |
| `organizationName` | Nama kelompok riset                                                           |
| `faculty`          | Nama fakultas                                                                 |
| `department`       | Nama departemen                                                               |
| `badge`            | Teks pada badge kecil di hero                                                 |
| `headline`         | Bagian awal judul hero                                                        |
| `headlineEmphasis` | Bagian yang ditampilkan miring & berwarna pasir                               |
| `headlineSuffix`   | Lanjutan judul setelah bagian miring                                          |
| `intro`            | Paragraf pengantar di hero (dipakai juga sebagai meta description)            |
| `aboutTitle`       | Judul bagian "Tentang"                                                        |
| `aboutParagraphs`  | Isi "Tentang". Pisahkan antar-paragraf dengan **Alt+Enter** di dalam satu sel |
| `address`          | Alamat kantor                                                                 |
| `email`            | Email kontak — juga menjadi tujuan formulir kontak                            |
| `phone`            | Telepon (opsional)                                                            |
| `mapsUrl`          | Tautan Google Maps (opsional)                                                 |
| `heroImage`        | Foto latar hero (opsional)                                                    |
| `foundedYear`      | Tahun berdiri                                                                 |

### `stats` — angka di bawah hero

`value` · `label` · `order`

Contoh: `90.4%` / `Akurasi klasifikasi Karimunjawa` / `3`

### `focus` — pilar riset

`icon` · `title` · `body` · `order`

`icon` diisi salah satu: `satellite`, `fish`, `sprout`, `chart`, `waves`,
`layers`. Nilai lain akan memakai ikon default.

### `team` — anggota tim

`name` · `role` · `field` · `photo` · `bio` · `email` · `scholarUrl` · `orcid` · `order`

`photo` boleh diisi link Google Drive biasa (hasil "Copy link") — situs
mengubahnya sendiri menjadi URL gambar langsung. Lihat [Foto](#foto).
Tanpa foto, kartu menampilkan inisial nama.

### `publications` — publikasi & output

`year` · `type` · `title` · `authors` · `venue` · `url` · `doi` · `order`

Tombol "Buka" hanya muncul kalau `url` diisi.

### `gallery` — dokumentasi lapangan

`title` · `caption` · `image` · `location` · `order`

Tanpa `image`, kartu memakai gradasi warna sebagai placeholder.

### `partners` — mitra

`name` · `url` · `logo` · `category` · `order`

---

## Foto

Foto tim, galeri, dan logo mitra bisa diambil dari Google Drive:

1. Unggah foto ke satu folder Drive.
2. Klik kanan folder → **Share** → **General access: Anyone with the link**
   (peran _Viewer_). Ini wajib, kalau tidak gambar tidak akan tampil di situs.
3. Untuk tiap foto: klik kanan → **Copy link**, tempel apa adanya ke kolom
   `photo` / `image` / `logo`.

Situs mengenali format link Drive dan mengubahnya menjadi URL gambar langsung,
sekaligus meminta versi yang sudah diperkecil agar halaman tetap ringan
(logika ini ada di `src/features/profile/data/media.ts`).

URL gambar dari sumber lain (`https://...jpg`) juga bisa dipakai langsung.

---

## Setelah mengubah isi spreadsheet

Ada dua lapis cache, jadi perubahan tidak langsung terlihat:

| Lapis        | Durasi                                  | Cara mempercepat                              |
| ------------ | --------------------------------------- | --------------------------------------------- |
| Apps Script  | 5 menit                                 | Buka URL `/exec` dengan tambahan `?refresh=1` |
| Server situs | 5 menit (`PROFILE_CONTENT_TTL_SECONDS`) | Tunggu, atau restart server                   |

Perubahan struktur (menambah sheet/kolom) tidak perlu deploy ulang Apps Script.
Perubahan pada `Code.gs` **perlu** deploy versi baru.

---

## Alias header

Header boleh ditulis dalam bahasa Indonesia; Apps Script memetakannya. Spasi,
tanda hubung, dan besar-kecil huruf diabaikan.

| Tulis begini | Sama dengan |
| ------------ | ----------- |
| `Nama`       | `name`      |
| `Peran`      | `role`      |
| `Bidang`     | `field`     |
| `Foto`       | `photo`     |
| `Tahun`      | `year`      |
| `Tipe`       | `type`      |
| `Penulis`    | `authors`   |
| `Tautan`     | `url`       |
| `Keterangan` | `caption`   |
| `Gambar`     | `image`     |
| `Lokasi`     | `location`  |
| `Kategori`   | `category`  |
| `Urutan`     | `order`     |

Daftar lengkapnya ada di `FIELD_ALIASES` dalam [`Code.gs`](Code.gs).

---

## Kalau konten tidak muncul

Buka URL `/exec` langsung di browser dan lihat apa yang keluar.

| Yang terlihat                             | Artinya                                                          |
| ----------------------------------------- | ---------------------------------------------------------------- |
| Halaman login Google                      | Deployment bukan **Anyone** — deploy ulang dengan akses `Anyone` |
| `{"error":"unauthorized"}`                | `SHARED_TOKEN` tidak cocok dengan `PROFILE_CONTENT_TOKEN`        |
| `{"error":"..."}` lain                    | Pesan error dari Apps Script — biasanya nama sheet salah         |
| JSON yang benar tapi situs tetap fallback | Cek `PROFILE_CONTENT_ENDPOINT` di `.env`, lalu restart server    |

Server situs mencatat alasan kegagalan ke log dengan awalan `[profile]`, dan
saat `npm run dev` alasannya juga tampil di banner kuning halaman profil.
