# Blue Carbon Research Group

Situs resmi Blue Carbon Research Group — Departemen Sains Informasi Geografi,
Fakultas Geografi, Universitas Gadjah Mada.

Satu aplikasi, dua produk yang dikembangkan terpisah:

| Bagian             | URL           | Isi                                                                                                      |
| ------------------ | ------------- | -------------------------------------------------------------------------------------------------------- |
| **Web Profile**    | `/`           | Profil kelompok riset, tim, publikasi, galeri, mitra, kontak. Kontennya ditarik dari Google Spreadsheet. |
| **Web Processing** | `/processing` | Workbench node-based untuk merancang pipeline pemetaan habitat perairan dangkal.                         |

## Menjalankan secara lokal

Butuh Node.js 20+ dan npm. Lockfile resmi proyek ini adalah `package-lock.json`
— gunakan npm, jangan campur dengan package manager lain.

```bash
npm install
```

```bash
npm run dev
```

Aplikasi berjalan di `http://localhost:8080`.

### Skrip yang tersedia

| Perintah            | Fungsi                                             |
| ------------------- | -------------------------------------------------- |
| `npm run dev`       | Dev server + HMR                                   |
| `npm run build`     | Build produksi (Nitro, preset `cloudflare-module`) |
| `npm run preview`   | Menjalankan hasil build                            |
| `npm run lint`      | ESLint                                             |
| `npm run typecheck` | `tsc --noEmit`                                     |
| `npm run format`    | Prettier                                           |

## Struktur kode

Kode dipisah per fitur agar Web Profile dan Web Processing bisa dikerjakan tanpa
saling mengganggu. Aturannya: **fitur tidak boleh saling mengimpor** — apa pun
yang dipakai berdua naik ke `src/shared/`.

```
src/
├── routes/                  # File-based routing (tipis: metadata + komposisi saja)
│   ├── __root.tsx           # Shell aplikasi, header, error & 404 boundary
│   ├── index.tsx            # → Web Profile
│   └── processing.tsx       # → Web Processing
│
├── features/
│   ├── profile/             # ── WEB PROFILE ──
│   │   ├── api/             # Server function: ambil konten dari Google Sheets
│   │   ├── components/      # Satu file per section halaman
│   │   ├── data/            # Konten fallback + normalisasi baris sheet
│   │   ├── types.ts         # Skema & tipe konten profil
│   │   └── index.ts         # Public surface fitur ini
│   │
│   └── processing/          # ── WEB PROCESSING ──
│       ├── components/      # Workbench, palette, property panel, console
│       ├── data/            # Katalog node + template pipeline
│       └── index.ts
│
├── shared/                  # Dipakai kedua fitur
│   ├── components/layout/   # Header situs + primitif Section/SectionHeader
│   ├── components/ui/       # Primitif shadcn/ui yang benar-benar dipakai
│   └── lib/                 # utils, error capture & reporting
│
├── router.tsx               # Entry router
├── server.ts                # Entry SSR (pembungkus error)
├── start.ts                 # Middleware request (CSRF + error)
└── styles.css               # Token tema + utility Tailwind v4
```

Impor selalu lewat alias `@/`, mis. `@/shared/components/ui/button`.

Direktori ini dijaga bebas kode mati: `src/shared/components/ui/` hanya berisi
komponen yang benar-benar di-render. Kalau butuh komponen shadcn lain, tambahkan
saat dipakai (`npx shadcn@latest add <nama>`), bukan sebelumnya.

## Sistem desain

Satu bahasa visual dipakai kedua bagian situs: Web Profile tampil terang seperti
dokumen, Web Processing gelap seperti perkakas. Tema `dark` dipasang di
`__root.tsx` berdasarkan rute, sehingga header ikut berubah bersama halamannya.

Aturan yang membuatnya konsisten:

- **Semua band halaman memakai `<Section>`** dari
  `@/shared/components/layout/section` — lebar maksimum, padding, dan pilihan
  nada (`default` / `muted` / `deep`) ditentukan di satu tempat.
- **Semua judul section memakai `<SectionHeader>`**, dengan nomor urut yang
  dihitung dari section yang benar-benar tampil.
- **Label kecil memakai utility `eyebrow`** (JetBrains Mono, uppercase,
  tracking) — dipakai di profil maupun di panel workbench.
- **Angka memakai utility `tabular`** agar digit sejajar.
- **Focus ring didefinisikan sekali** lewat `:focus-visible` global di
  `styles.css`; komponen tidak menambah ring sendiri.
- **Tinggi header ada di `--header-height`**, dipakai ulang oleh layout
  workbench dan offset scroll anchor.

## Konten Web Profile (Google Sheets)

Isi halaman profil — termasuk foto tim dan galeri — dibaca dari Google
Spreadsheet lewat Google Apps Script, sehingga tim bisa memperbarui konten tanpa
menyentuh kode.

Panduan setup lengkap (kode Apps Script, struktur sheet, langkah deploy) ada di
[`scripts/apps-script/README.md`](scripts/apps-script/README.md).

Ringkasnya:

1. Buat spreadsheet dengan sheet `site`, `stats`, `focus`, `team`,
   `publications`, `gallery`, `partners`.
2. Deploy `scripts/apps-script/Code.gs` sebagai Web App (akses: _Anyone_).
3. Salin `.env.example` menjadi `.env` lalu isi URL hasil deploy:

```bash
cp .env.example .env
```

Jika `PROFILE_CONTENT_ENDPOINT` kosong atau Google sedang tidak bisa dihubungi,
halaman tetap tampil memakai konten fallback di
`src/features/profile/data/fallback-content.ts` — situs tidak pernah blank.

## Teknologi

TanStack Start · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui ·
React Flow (`@xyflow/react`) · Zod · Nitro
