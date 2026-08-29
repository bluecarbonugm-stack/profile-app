-- Phase 3: Supabase schema + seed for Blue Carbon content backend
-- Run this in Supabase Dashboard → SQL Editor

-- ============================================================
-- 1. TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS site (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name text NOT NULL DEFAULT '',
  faculty text NOT NULL DEFAULT '',
  department text NOT NULL DEFAULT '',
  badge text NOT NULL DEFAULT '',
  headline text NOT NULL DEFAULT '',
  headline_emphasis text NOT NULL DEFAULT '',
  headline_suffix text NOT NULL DEFAULT '',
  intro text NOT NULL DEFAULT '',
  about_title text NOT NULL DEFAULT '',
  about_paragraphs text[] NOT NULL DEFAULT '{}',
  address text,
  email text,
  phone text,
  maps_url text,
  hero_image text,
  logo_url text,
  founded_year text
);

-- Added after initial launch: organization mark shown in the hero. Safe to
-- re-run against a database created before this column existed.
ALTER TABLE site ADD COLUMN IF NOT EXISTS logo_url text;

CREATE TABLE IF NOT EXISTS stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  value text NOT NULL,
  label text NOT NULL,
  sort_order int4 NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS focus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icon text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  sort_order int4 NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS team (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  field text NOT NULL,
  sort_order int4 NOT NULL DEFAULT 0,
  photo_url text
);

CREATE TABLE IF NOT EXISTS publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year text NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  authors text NOT NULL,
  venue text NOT NULL,
  sort_order int4 NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  caption text NOT NULL,
  image_url text NOT NULL DEFAULT '',
  sort_order int4 NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sort_order int4 NOT NULL DEFAULT 0
);

-- ============================================================
-- 2. ROW-LEVEL SECURITY
-- ============================================================

ALTER TABLE site ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus ENABLE ROW LEVEL SECURITY;
ALTER TABLE team ENABLE ROW LEVEL SECURITY;
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON site FOR SELECT USING (true);
CREATE POLICY "Public read" ON stats FOR SELECT USING (true);
CREATE POLICY "Public read" ON focus FOR SELECT USING (true);
CREATE POLICY "Public read" ON team FOR SELECT USING (true);
CREATE POLICY "Public read" ON publications FOR SELECT USING (true);
CREATE POLICY "Public read" ON gallery FOR SELECT USING (true);
CREATE POLICY "Public read" ON partners FOR SELECT USING (true);

CREATE POLICY "Admin write" ON site FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write" ON stats FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write" ON focus FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write" ON team FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write" ON publications FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write" ON gallery FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write" ON partners FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- 3. STORAGE
-- ============================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. SEED DATA (from fallback-content.ts)
-- ============================================================

INSERT INTO site (organization_name, faculty, department, badge, headline, headline_emphasis, headline_suffix, intro, about_title, about_paragraphs, address, email, founded_year)
VALUES (
  'Blue Carbon Research Group',
  'Fakultas Geografi UGM',
  'Departemen Sains Informasi Geografi',
  'Fakultas Geografi UGM',
  'Memetakan ekosistem',
  'blue carbon',
  'Indonesia dengan penginderaan jauh dan machine learning.',
  'Blue Carbon Research Group meneliti habitat perairan laut dangkal (terumbu karang, lamun, dan mangrove) menggabungkan citra satelit multispektral, survei lapangan, dan klasifikasi Random Forest untuk mendukung ocean accounting nasional.',
  'Riset yang berpijak pada laut Indonesia.',
  ARRAY[
    'Blue Carbon Research Group adalah kelompok riset di Departemen Sains Informasi Geografi, Fakultas Geografi Universitas Gadjah Mada. Kami memfokuskan diri pada pemetaan dan pemantauan ekosistem pesisir (terumbu karang, padang lamun, dan mangrove) yang punya nilai ekologis-ekonomis besar sekaligus rentan terhadap tekanan iklim dan pembangunan.',
    'Karya kami berpangkal pada kebutuhan data spasial habitat perairan dangkal yang akurat untuk ocean account nasional. Kami bekerja bersama mitra industri seperti PT Mitra Geotama Indonesia dan lembaga pengelola kawasan untuk menghasilkan panduan teknis yang bisa dipakai praktisi di lapangan.'
  ],
  'Fakultas Geografi UGM, Sekip Utara, Sleman, DIY 55281',
  'bluecarbon@geo.ugm.ac.id',
  '2018'
);

INSERT INTO stats (value, label, sort_order) VALUES
  ('12+', 'Publikasi & panduan teknis', 1),
  ('5', 'Wilayah studi kasus', 2),
  ('90.4%', 'Akurasi klasifikasi Karimunjawa', 3),
  ('2018', 'Tahun berdiri', 4);

INSERT INTO focus (icon, title, body, sort_order) VALUES
  ('satellite', 'Pra-Pemrosesan Citra', 'Koreksi atmosfer, sunglint (Hedley), dan kolom air (Lyzenga DII) pada citra multispektral Sentinel-2 / Landsat.', 1),
  ('fish', 'Survei Lapangan', 'Metode photo-quadrate, photo-transect, dan analisis foto (CPCe) untuk membangun sampel training-validation habitat.', 2),
  ('sprout', 'Klasifikasi Machine Learning', 'Random Forest dengan tuning nTree, variable selection, dan impurity, plus uji akurasi confusion matrix per skema klasifikasi.', 3),
  ('chart', 'Analisis Multi-Temporal', 'Deteksi perubahan luasan dan spasial habitat lintas periode untuk memantau dinamika ekosistem pesisir.', 4);

INSERT INTO team (name, role, field, sort_order) VALUES
  ('Prof. Dr. Pramaditya Wicaksono', 'Principal Investigator', 'Coastal remote sensing', 1),
  ('Dr. Rifky Ardiyanto', 'Senior Researcher', 'Machine learning & GIS', 2),
  ('Sinta D. Harahap, M.Sc.', 'Researcher', 'Habitat mapping', 3),
  ('F. Firdausman, M.Sc.', 'Researcher', 'Photogrammetry & UAV', 4),
  ('Julian Wijaya, M.Sc.', 'Researcher', 'Field survey lead', 5),
  ('Nadia Salsabila', 'Research Assistant', 'Data pipeline', 6);

INSERT INTO publications (year, type, title, authors, venue, sort_order) VALUES
  ('2023', 'Technical Guide', 'Panduan Teknis Survei dan Pemetaan Habitat Perairan Laut Dangkal Menggunakan Citra Penginderaan Jauh dan Klasifikasi Machine Learning', 'Harahap, S. D., Firdausman, F., Wijaya, J., Wicaksono, P., & Ardiyanto, R.', 'Blue Carbon Research Group, UGM & PT Mitra Geotama Indonesia', 1),
  ('2022', 'Journal', 'Random Forest classification of shallow-water benthic habitats using Sentinel-2 imagery in Karimunjawa Islands', 'Wicaksono, P. et al.', 'Remote Sensing', 2),
  ('2021', 'Proceedings', 'Depth-invariant index optimization for seagrass mapping in Indonesian shallow waters', 'Ardiyanto, R. et al.', 'IGARSS 2021', 3),
  ('2020', 'Report', 'Blue carbon accounting framework for Indonesian coastal management', 'Blue Carbon Research Group', 'Technical Report', 4);

INSERT INTO gallery (title, caption, image_url, sort_order) VALUES
  ('Photo-quadrate', 'Pengambilan sampel substrat dasar perairan.', '', 1),
  ('Photo-transect', 'Transek foto sepanjang garis survei.', '', 2),
  ('Substrat lamun', 'Identifikasi kerapatan padang lamun.', '', 3),
  ('Deployment UAV', 'Akuisisi citra resolusi tinggi kawasan pesisir.', '', 4),
  ('Analisis CPCe', 'Klasifikasi tutupan dasar dari foto lapangan.', '', 5),
  ('Field brief', 'Persiapan tim sebelum survei lapangan.', '', 6);

INSERT INTO partners (name, sort_order) VALUES
  ('Fakultas Geografi UGM', 1),
  ('PT Mitra Geotama Indonesia', 2),
  ('KKP Republik Indonesia', 3),
  ('BRIN', 4),
  ('Balai Taman Nasional Karimunjawa', 5),
  ('PUSPICS', 6);
