# Panduan kontribusi (manusia & agen)

Website Blue Carbon Research Group UGM. Satu aplikasi TanStack Start yang berisi
dua produk: **Web Profile** (`/`) dan **Web Processing** (`/processing`), plus
panel admin (`/admin`) untuk mengelola konten profil.

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
- Label kecil memakai utility `eyebrow`, angka memakai `tabular`, paragraf
  panjang memakai `measure`, tautan berwarna memakai `link-rule`. Keempatnya
  didefinisikan di `styles.css`.
- Form admin (`/admin/**`) memakai primitif dari
  `@/features/profile/components/admin/admin-field` (`TextField`,
  `TextAreaField`, `NumberField`, `AdminPageHeader`, `AdminEditCard`,
  `AdminListRow`) — jangan menulis ulang `<input className="border-gray-300">`
  atau hex warna literal per route.
- Jangan menambahkan focus ring per komponen — sudah ada `:focus-visible`
  global. Menambah ring kedua membuat fokus terlihat tidak seragam.
- Section menyembunyikan dirinya saat datanya kosong, dan nomor urutnya dihitung
  dari section yang tampil (lihat `ProfilePage.tsx`).
- Tema `dark` dipasang di `__root.tsx` per rute, bukan di dalam komponen rute.
- `<Section>` sudah membawa scroll-reveal (`useReveal` +
  `.reveal`/`.reveal-visible`) — jangan tambah IntersectionObserver sendiri.
  Kartu dalam grid yang ingin animasi bertahap memakai className
  `reveal-item`, bukan menulis delay manual.
- Identitas visual organisasi memakai `<BrandMark>`
  (`@/shared/components/brand/brand-mark`) sebagai fallback, dan
  `site.logoUrl`/`site.heroImage` saat admin sudah mengisinya — jangan pakai
  ikon lucide generik (mis. `Waves`) sebagai logo.

## Data konten profil

Konten halaman profil berasal dari Supabase (tabel `site`, `stats`, `focus`,
`team`, `publications`, `gallery`, `partners`), dibaca di server
(`src/features/profile/api/content-source.ts`) dengan cache in-memory dan
validasi Zod. Selalu sediakan fallback: kalau Supabase tidak terjangkau,
halaman harus tetap render memakai
`src/features/profile/data/fallback-content.ts`.

Admin mengedit konten lewat `/admin/**` (login via Supabase Auth, tulis lewat
TanStack server functions di `api/admin-content.ts`). Setiap tulis memanggil
`invalidateProfileContentCache()` agar perubahan langsung terlihat di halaman
publik.

Jangan pernah menaruh URL Supabase / service-role key di kode klien atau di
variabel berawalan `VITE_` — keduanya ikut terkirim ke browser. Gunakan
`SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` (server-only,
lihat `.env.example`).

## Sebelum commit

```bash
npm run typecheck && npm run lint && npm run build
```

## Routing

File-based routing TanStack Start. `src/routeTree.gen.ts` di-generate otomatis —
jangan diedit tangan. Konvensi penamaan file route ada di
[`src/routes/README.md`](src/routes/README.md).
