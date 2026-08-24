# 🎨 UI/UX Design Brief — Referensi Clone Zed.dev

> **Status validasi:** Struktur konten & copy diambil langsung dari live fetch zed.dev (Agustus 2026). Nilai desain teknis (hex color, px pasti, font-weight) **belum bisa diverifikasi 100%** karena environment ini tidak punya browser render/screenshot tool — hanya bisa membaca konten halaman, bukan computed CSS. Rekomendasi di bagian akhir soal cara tim mendapatkan nilai pasti.

---

## 1. Ringkasan Eksekutif

Zed.dev mengusung **"developer-first minimalism"**: desain bersih dan utilitarian, tapi punya kedalaman lewat komponen bertema terminal/editor (live git feed, panel agent-coding, preview kode dengan syntax highlight). Halaman ini membangun kepercayaan lewat _social proof_ dari developer terkenal, demo interaktif yang terasa "hidup", dan whitespace yang lega tanpa terasa kosong.

Yang membedakan Zed dari landing page SaaS generik: **komponen yang meniru tampilan aplikasi aslinya** (terminal ASCII art, feed commit git real-time, panel chat-agent dengan diff kode) — bukan sekadar ilustrasi statis.

---

## 2. Struktur Halaman (Terverifikasi dari Konten Live)

Urutan section aktual, dari atas ke bawah:

1. **Top banner promo** — bar sempit di atas nav, mengumumkan fitur/produk terbaru (saat ini: "Introducing: Delta") dengan link panah `→`
2. **Navbar** — Product, Resources, Extensions, Docs, Business, Pricing, Sign up, Download
3. **Hero** — headline besar "Your last next editor", subheadline singkat, dua CTA (Download / Clone source), keterangan platform (macOS/Linux/Windows)
4. **Live Git Activity Feed** — komponen signature: 3 kolom repo (mis. editor core, cloud, zed.dev) menampilkan commit message, nama branch, waktu relatif, dan diff stat (+/-) bergaya terminal
5. **Agentic Coding Demo Panel** — panel interaktif menunjukkan percakapan dengan AI agent di sebelah file tree/preview kode, termasuk contoh potongan kode dengan error linter yang di-highlight — ini elemen unik yang **tidak ada di draft sebelumnya**
6. **Fitur utama 3-kolom** — Fast / Agentic / Collaborative, masing-masing icon + judul + deskripsi singkat
7. **Terminal branding block** — ASCII art logo "ZED" bergaya prompt shell (`zed.dev — zsh`), dengan keterangan editor/platform/bahasa
8. **Social proof / testimonial** — kutipan dari figur developer terkenal (pencipta bahasa pemrograman, engineer terkenal), masing-masing dengan avatar bulat, nama, dan jabatan/afiliasi
9. **"Zed Just Works"** — headline pendukung + CTA (View Roadmap, View Releases)
10. **Feature showcase dengan video** — 5 fitur besar (Parallel Agents, Debugger, Agentic Editing, Native Git Support, Edit Prediction), masing-masing dengan tombol "Expand Video / Play Video" — **preview video per fitur, bukan gambar statis**
11. **3 sub-fitur ringkas** — Remote Development, Multibuffer Editing, Vim-friendly (icon + judul + 1 kalimat)
12. **Section AI** — "AI that works the way you code", 4 kartu fitur (Agentic Editing, Edit Prediction, Inline Assistant, Any Agent Any Tool) masing-masing dengan video preview
13. **Extensions ecosystem** — grid kartu ekstensi nyata (nama, jumlah download, author), CTA "Create Extension" / "View All Extensions"
14. **"Built with ultimate care"** — feature grid padat (Helix Mode, Diagnostics Multibuffer, Dev Containers, CLI, Rainbow Brackets, REPL, dll), campuran video-preview untuk fitur besar dan ikon+teks untuk fitur kecil
15. **"From the team"** — surat naratif dari tim inti, nama-nama pendiri
16. **Blog / "The latest from Zed"** — daftar 4 post terbaru dengan tanggal dan penulis, CTA "View Blog"
17. **CTA penutup** — ulangi Download/Clone source
18. **Footer** — multi-kolom link (Product, Resources, Company, Social), copyright

---

## 3. Elemen UI yang Perlu Diperhatikan Tim (Unik ke Zed)

### 3.1 Live Git Activity Feed

Komponen paling khas di halaman ini. Pola:

- Tiap baris = satu commit: indikator status (dot/warna), nama branch, waktu relatif ("4m", "2h", "1d")
- Diff stat ditampilkan sebagai `+N` (hijau) `-N` (merah)
- Font monospace, ukuran kecil, background gelap kontras dengan bagian putih di sekitarnya
- Terlihat seperti data live/streaming — untuk clone, cukup buat dengan mock data yang di-update berkala (bukan perlu real backend)

### 3.2 Panel Demo Agentic Coding

- Layout split: sisi kiri percakapan chat dengan AI, sisi kanan preview file/kode
- Kode ditampilkan dengan syntax highlighting + anotasi inline (mis. warning linter muncul sebagai underline dengan tooltip)
- Ini elemen yang paling kompleks untuk di-clone — sarankan mulai dengan versi statis (screenshot/gif) dulu sebelum bikin interaktif

### 3.3 Terminal ASCII Branding

- Blok ASCII art text-based (nama produk dalam karakter box-drawing), ditampilkan dalam frame ala terminal prompt (`nama-domain — zsh`)
- Font monospace wajib, biasanya di background gelap

### 3.4 Video Preview per Fitur

- Setiap fitur besar (bukan sub-fitur kecil) punya tombol "Play Video" / "Expand Video" — bukan gambar statis
- Untuk clone awal, bisa diganti GIF loop pendek atau gambar dengan overlay tombol play sebagai placeholder

### 3.5 Extension Cards

- Grid card: nama ekstensi, jumlah download (format singkat seperti "6.2M", "973k"), nama author/kontributor
- Grid responsif, bisa dipadatkan 4+ kolom di desktop

---

## 4. Sistem Desain — Terverifikasi dari CSS Asli ✅

> Update: bagian ini sudah diganti total. Sebelumnya berisi tebakan/estimasi — sekarang berdasarkan **CSS custom properties asli** yang diambil langsung dari `:root` zed.dev (konfirmasi: dibangun dengan **Tailwind CSS v4**, terlihat dari pola penamaan `--color-*`, `--text-*`, `--breakpoint-*`). Nilai `lab()` dikonversi ke hex sRGB pakai formula standar CSS Color 4 (D50→D65 Bradford + gamma sRGB) — hasil konversi cocok persis dengan palet default Tailwind v4, jadi perhitungannya bisa dipercaya.

### 4.1 Koreksi penting dari draft sebelumnya

- ❌ Font body **bukan** Inter — font aslinya adalah **font kustom bernama `writer`** (dengan fallback `writer Fallback`), bukan sans-serif umum.
- ❌ Font mono **bukan** JetBrains Mono — Zed pakai **font kustom sendiri `zedMono`**. Ada juga font serif kustom `plexSerif` (kemungkinan dipakai di section editorial seperti "A letter" atau blog).
- ❌ Warna heading **bukan** bold/gray-900 pekat — heading pakai **font-weight sangat ringan (340–410)**, jauh lebih tipis dari asumsi "bold 700" sebelumnya. Ini kunci karakter visual Zed: heading besar tapi tipis/elegan, bukan tebal.
- ❌ Background nav **bukan** pure white — nilai asli: **`#F7F7F2`** (off-white/cream halus).
- ❌ Warna teks body **bukan** gray-900 — warna asli: `offgray-800` (~`#474C55`), palet gray kustom bertema dingin, bukan gray Tailwind default.

### 4.2 Tipografi (nilai asli)

| Role                             | Font Family Asli                                        |
| -------------------------------- | ------------------------------------------------------- |
| Body / UI                        | `writer, writer Fallback` (font kustom)                 |
| Kode / terminal                  | `zedMono, zedMono Fallback` (font kustom)               |
| Editorial / serif (blog, letter) | `plexSerif, plexSerif Fallback`                         |
| Fallback sistem (sans)           | `ui-sans-serif, system-ui, sans-serif`                  |
| Fallback sistem (mono)           | `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas` |

**Font-weight heading (real, custom per-level):**

| Level | Weight |
| ----- | ------ |
| h0    | 340    |
| h1    | 390    |
| h2    | 390    |
| h3    | 380    |
| h4    | 410    |

**Type scale (rem → px):**

| Token     | Value           |
| --------- | --------------- |
| text-xs   | 0.75rem (12px)  |
| text-sm   | 0.875rem (14px) |
| text-base | 1rem (16px)     |
| text-lg   | 1.125rem (18px) |
| text-xl   | 1.25rem (20px)  |
| text-2xl  | 1.5rem (24px)   |
| text-3xl  | 1.875rem (30px) |
| text-5xl  | 3rem (48px)     |
| text-6xl  | 3.75rem (60px)  |

Weight utilitas standar: `normal 400 / medium 500 / semibold 600 / bold 700` — dipakai untuk UI/label, bukan heading besar.

### 4.3 Warna Netral & Brand (hex asli, dikonversi dari lab())

| Token                 | Hex       | Catatan                                                                       |
| --------------------- | --------- | ----------------------------------------------------------------------------- |
| `--nav-bg-color`      | `#F7F7F2` | Background navbar, nilai langsung (bukan konversi)                            |
| `--color-accent-blue` | `#1348DC` | Warna aksen/CTA utama                                                         |
| `--cream` (base)      | `#7F7866` | Basis skala `cream-*`, warm neutral                                           |
| `--offgray` (base)    | `#727A89` | Basis skala `offgray-*`, dipakai untuk **text color default** (`offgray-800`) |

**Skala `offgray-*`** (dipakai untuk teks & neutral UI, gantikan asumsi gray Tailwind biasa) — diperkirakan lewat blending karena aslinya di-generate via `color-mix(in oklch, ...)`:

| Token                                | ~Hex (perkiraan) |
| ------------------------------------ | ---------------- |
| offgray-50                           | `#E3E4E7`        |
| offgray-100                          | `#CED0D6`        |
| offgray-400                          | `#878E9B`        |
| offgray-500 (base)                   | `#727A89`        |
| offgray-700                          | `#535964`        |
| **offgray-800 (teks body default!)** | `#474C55`        |
| offgray-900                          | `#34383F`        |

**Skala `cream-*`** (dipakai untuk aksen warm/background alternatif):

| Token     | ~Hex (perkiraan) |
| --------- | ---------------- |
| cream-50  | `#F5F4F3`        |
| cream-100 | `#D1CEC8`        |
| cream-700 | `#5B5649`        |
| cream-900 | `#38352D`        |

> ⚠️ Skala `cream-*`/`offgray-*` di atas adalah **perkiraan blending linear**, karena nilai asli di-generate pakai `color-mix(in oklch, ...)` yang sedikit berbeda dari blending biasa. Untuk presisi penuh, generate ulang pakai `color-mix()` langsung di CSS, bukan hardcode hex ini.

### 4.4 Palet Semantik (diff, status) — hex terverifikasi

Dipakai kemungkinan besar untuk **Live Git Activity Feed** (indikator +/− commit):

| Token                     | Hex       |
| ------------------------- | --------- |
| green-500                 | `#00C950` |
| green-600                 | `#00A63E` |
| red-500                   | `#FB2C36` |
| red-600                   | `#E7000B` |
| blue-600                  | `#155DFC` |
| gray-200 (border default) | `#E5E7EB` |

### 4.5 Motif Dekoratif & Shader Hero (temuan baru — tidak ada di draft sebelumnya!)

Zed.dev punya sistem warna khusus untuk **efek shader/dithering di background hero**, dikontrol lewat opacity variable (`--hero-shader-opacity: .1`, `--funding-shader-opacity: .08`) — jadi efeknya sangat subtle, bukan warna solid mencolok:

| Token               | Value                    |
| ------------------- | ------------------------ |
| `--motif-subtle-1`  | `#FF5500` (~65% opacity) |
| `--motif-subtle-2`  | `#FFD500` (~35% opacity) |
| `--motif-accent-1`  | `#1E69F6`                |
| `--motif-accent-2`  | `#93CCDC`                |
| `--dithering-front` | `#0751CF`                |
| `--dithering-back`  | `#0751CF` (~50% opacity) |

→ Untuk clone: buat layer gradient/noise/dithering tipis di background hero pakai kombinasi warna ini di opacity rendah, bukan gambar statis.

### 4.6 Shadow — dua sistem berbeda

1. **Drop shadow standar (halus)**: `--drop-shadow-sm: 0 1px 2px #00000026` dan `--drop-shadow-md: 0 3px 3px #0000001f` — jauh lebih tipis dari `shadow-xl` yang ditebak di draft awal.
2. **Hard-offset shadow kustom (unik!)**: `--sh-default`, `--sh-alt`, `--sh-alt-opposite` — pakai offset keras 6px tanpa blur, warna biru sangat transparan (`#074dcf0f`, ~6% opacity), muncul di dua sisi berlawanan (`6px 6px 0` dan `-6px -6px 0`). Ini gaya neubrutalist-ringan dengan tint biru, bukan shadow abu-abu biasa — elemen khas yang perlu ditiru di kartu/blok tertentu.

### 4.7 Border Radius (nilai asli)

| Token      | Value          |
| ---------- | -------------- |
| radius-xs  | 0.125rem (2px) |
| radius-sm  | 0.25rem (4px)  |
| radius-md  | 0.375rem (6px) |
| radius-lg  | 0.5rem (8px)   |
| radius-xl  | 0.75rem (12px) |
| radius-2xl | 1rem (16px)    |

### 4.8 Layout & Content Width (nilai asli)

| Token                          | Value                                       |
| ------------------------------ | ------------------------------------------- |
| `--blog-content-width`         | 740px                                       |
| `--markdown-layout-width`      | 45rem (720px) — untuk halaman docs/markdown |
| `--breakpoint-sm`              | 640px                                       |
| Container terbesar terdefinisi | 64rem (1024px, `container-5xl`)             |

### 4.9 Animasi (dikonfirmasi ada di CSS, bukan tebakan)

| Animasi                                     | Keterangan                                                                 |
| ------------------------------------------- | -------------------------------------------------------------------------- |
| `animate-fade` / `animate-fade-up`          | Scroll-reveal fade masuk, dipakai antar section                            |
| `animate-blink`                             | Cursor/caret berkedip (1s step-end) — cocok dengan komponen terminal/ASCII |
| `animate-spin-slow` / `animate-spin-slower` | Rotasi lambat 32s/50s — kemungkinan elemen dekoratif di background         |

### 4.10 Catatan tambahan

- Ada set variable `--c15t-*` (warna, spacing, shadow) di file CSS yang sama — ini **bukan** bagian dari design system Zed, melainkan milik widget consent-management pihak ketiga (**c15t**) untuk banner "Manage Site Cookies" di footer. Jangan dijadikan acuan brand token.
- `text-rendering: geometricprecision !important` dan `-webkit-font-smoothing: antialiased !important` diterapkan global — detail kecil yang mempengaruhi ketajaman render font, worth ditiru untuk hasil visual identik.
- Ada `text-shadow: 1px 1px 1px #00000001` global — nyaris tidak terlihat (opacity 1%), efek tekstur sangat halus, opsional untuk ditiru.

---

## 5. Rekomendasi Langkah Selanjutnya untuk Tim

1. **Ambil nilai desain pasti via DevTools** — buka zed.dev di Chrome, Inspect Element pada tiap komponen kunci (hero, activity feed, kartu ekstensi), catat computed styles (color, font-family, font-size, padding) langsung dari panel Styles/Computed.
2. **Screenshot manual per section** — untuk referensi visual yang presisi, screenshot tiap section langsung dari browser (full-page screenshot extension lebih baik daripada saya deskripsikan dari teks).
3. **Prioritaskan komponen signature dulu**: Live Activity Feed dan Terminal ASCII block adalah yang paling membedakan visual Zed — kerjakan ini lebih dulu sebelum feature-grid generik.
4. **Video/GIF placeholder**: karena banyak fitur pakai video preview, siapkan aset placeholder (gambar + ikon play) di awal, video asli bisa menyusul.
5. **Cek lisensi/hak cipta** sebelum mereplikasi testimonial asli, nama tokoh publik, atau logo — untuk versi produksi, sebaiknya ganti dengan testimonial internal/dummy, bukan menyalin nama & kutipan asli dari developer terkenal tersebut.

---

## 6. Tech Stack yang Umum Dipakai untuk Pola Seperti Ini

| Layer          | Opsi Umum                                             |
| -------------- | ----------------------------------------------------- |
| Framework      | Next.js (App Router)                                  |
| Styling        | Tailwind CSS                                          |
| Font monospace | JetBrains Mono / Fira Code / IBM Plex Mono            |
| Animasi scroll | Framer Motion                                         |
| Live feed      | Mock data + interval update (tanpa backend real dulu) |

---

**Catatan penting (update):** Brief ini sekarang tervalidasi dari **dua sisi**: (1) struktur konten & copy dari fetch langsung zed.dev, dan (2) design token warna/tipografi/radius/shadow dari **CSS custom properties asli** yang di-supply user (bukan tebakan lagi — lihat Section 4). Yang masih perlu dicek manual via DevTools: skala `cream-*`/`offgray-*` turunan (karena aslinya pakai `color-mix(in oklch,...)` yang saya dekati lewat blending linear, bukan hasil exact), dan mapping token ke tiap komponen visual spesifik (mis. warna mana persis dipakai di kartu ekstensi vs activity feed) — karena saya tidak punya browser render untuk screenshot langsung, jadi tidak bisa memvalidasi _penerapannya_ secara visual, hanya nilai tokennya.
