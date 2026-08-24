# Panduan kontribusi (manusia & agen)

Website Blue Carbon Research Group UGM. Satu aplikasi TanStack Start yang berisi
dua produk: **Web Profile** (`/`) dan **Web Processing** (`/processing`).

## Aturan arsitektur

1. **Fitur tidak saling mengimpor.** `src/features/profile/**` tidak boleh
   mengimpor `src/features/processing/**`, dan sebaliknya. Kalau ada kode yang
   dibutuhkan keduanya, pindahkan ke `src/shared/`.
2. **`src/routes/**` tetap tipis.** Isinya hanya metadata `head()`, loader, dan
   memasang komponen dari `features/`. Jangan taruh logika UI di sini.
3. **Impor lewat alias `@/`**, bukan path relatif berlapis (`../../..`).
4. **Setiap fitur mengekspor lewat `index.ts`-nya.** Route dan `shared` sebaiknya
   mengimpor dari `@/features/<nama>`, bukan menembus ke file dalamnya.
5. **`src/shared/components/ui/` hanya berisi komponen yang dipakai.** Direktori
   ini sengaja dijaga minimal — jangan menambah komponen shadcn "untuk
   jaga-jaga". Tambahkan saat benar-benar dirender, hapus saat pemakaian
   terakhirnya hilang.

## Aturan UI

- Setiap band halaman profil dibungkus `<Section>`, judulnya memakai
  `<SectionHeader>` (`@/shared/components/layout/section`). Jangan menulis ulang
  `max-w` / `padding` / markup eyebrow per section.
- Label kecil memakai utility `eyebrow`, angka memakai `tabular`. Keduanya
  didefinisikan di `styles.css`.
- Jangan menambahkan focus ring per komponen — sudah ada `:focus-visible`
  global. Menambah ring kedua membuat fokus terlihat tidak seragam.
- Section menyembunyikan dirinya saat datanya kosong, dan nomor urutnya dihitung
  dari section yang tampil (lihat `ProfilePage.tsx`).
- Tema `dark` dipasang di `__root.tsx` per rute, bukan di dalam komponen rute.

## Data konten profil

Konten halaman profil berasal dari Google Spreadsheet via Apps Script, diambil
di server (`src/features/profile/api/`) dengan cache dan validasi Zod. Selalu
sediakan fallback: kalau sheet gagal dibaca, halaman harus tetap render memakai
`src/features/profile/data/fallback-content.ts`.

Jangan pernah menaruh URL endpoint atau token di kode klien atau di variabel
berawalan `VITE_` — keduanya ikut terkirim ke browser.

## Sebelum commit

```bash
npm run typecheck && npm run lint && npm run build
```

## Routing

File-based routing TanStack Start. `src/routeTree.gen.ts` di-generate otomatis —
jangan diedit tangan. Konvensi penamaan file route ada di
[`src/routes/README.md`](src/routes/README.md).
