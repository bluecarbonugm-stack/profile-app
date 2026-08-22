import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Waves, Satellite, MapPin, GraduationCap, Mail, ArrowRight, Fish, Sprout, Layers, LineChart,
  Download, Building2,
} from "lucide-react";

// TODO: ganti dengan data asli tim.
const TEAM = [
  { name: "Prof. Dr. Pramaditya Wicaksono", role: "Principal Investigator", field: "Coastal remote sensing" },
  { name: "Dr. Rifky Ardiyanto", role: "Senior Researcher", field: "Machine learning & GIS" },
  { name: "Sinta D. Harahap, M.Sc.", role: "Researcher", field: "Habitat mapping" },
  { name: "F. Firdausman, M.Sc.", role: "Researcher", field: "Photogrammetry & UAV" },
  { name: "Julian Wijaya, M.Sc.", role: "Researcher", field: "Field survey lead" },
  { name: "Nadia Salsabila", role: "Research Assistant", field: "Data pipeline" },
];

const PUBLICATIONS = [
  {
    year: 2023, type: "Technical Guide",
    title: "Panduan Teknis Survei dan Pemetaan Habitat Perairan Laut Dangkal Menggunakan Citra Penginderaan Jauh dan Klasifikasi Machine Learning",
    authors: "Harahap, S. D., Firdausman, F., Wijaya, J., Wicaksono, P., & Ardiyanto, R.",
    venue: "Blue Carbon Research Group, UGM & PT Mitra Geotama Indonesia",
  },
  {
    year: 2022, type: "Journal",
    title: "Random Forest classification of shallow-water benthic habitats using Sentinel-2 imagery in Karimunjawa Islands",
    authors: "Wicaksono, P. et al.",
    venue: "Remote Sensing (mock DOI)",
  },
  {
    year: 2021, type: "Proceedings",
    title: "Depth-invariant index optimization for seagrass mapping in Indonesian shallow waters",
    authors: "Ardiyanto, R. et al.",
    venue: "IGARSS 2021 (mock)",
  },
  {
    year: 2020, type: "Report",
    title: "Blue carbon accounting framework for Indonesian coastal management",
    authors: "Blue Carbon Research Group",
    venue: "Technical Report (mock)",
  },
];

const PARTNERS = [
  "Fakultas Geografi UGM",
  "PT Mitra Geotama Indonesia",
  "KKP Republik Indonesia",
  "BRIN",
  "Balai Taman Nasional Karimunjawa",
  "PUSPICS",
];

export function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <About />
      <Focus />
      <Team />
      <Publications />
      <CaseStudy />
      <Gallery />
      <Partners />
      <Contact />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-ocean-gradient" />
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      <div className="relative mx-auto max-w-[1400px] px-4 py-24 md:py-32">
        <Badge className="bg-white/15 text-white border-white/20 hover:bg-white/20 backdrop-blur">
          <Waves className="h-3 w-3 mr-1" /> Fakultas Geografi UGM
        </Badge>
        <h1 className="mt-4 text-4xl md:text-6xl font-normal text-white max-w-3xl leading-[1.05]">
          Memetakan ekosistem <em className="text-sand">blue&nbsp;carbon</em> Indonesia dengan penginderaan jauh dan machine learning.
        </h1>
        <p className="mt-6 max-w-2xl text-white/80 text-base md:text-lg leading-relaxed">
          Blue Carbon Research Group meneliti habitat perairan laut dangkal — terumbu karang,
          lamun, dan mangrove — menggabungkan citra satelit multispektral, survei lapangan,
          dan klasifikasi Random Forest untuk mendukung <em>ocean accounting</em> nasional.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" className="bg-white text-ocean-deep hover:bg-white/90">
            <Link to="/processing">
              Coba alur kerja pemetaan <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-transparent text-white border-white/40 hover:bg-white/10 hover:text-white">
            <a href="#publikasi">Lihat publikasi</a>
          </Button>
        </div>
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl text-white/90">
          {[
            { k: "12+", v: "Publikasi & panduan teknis" },
            { k: "5", v: "Wilayah studi kasus" },
            { k: "90.4%", v: "Akurasi klasifikasi Karimunjawa" },
            { k: "2018", v: "Tahun berdiri" },
          ].map((s) => (
            <div key={s.v}>
              <div className="text-3xl font-display">{s.k}</div>
              <div className="text-xs text-white/70 mt-1">{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-20">
      <div className="grid md:grid-cols-[1fr_1.4fr] gap-10">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-accent font-medium">01 · Tentang</div>
          <h2 className="mt-2 text-3xl md:text-4xl">Riset yang berpijak pada laut Indonesia.</h2>
        </div>
        <div className="text-muted-foreground leading-relaxed space-y-4">
          <p>
            Blue Carbon Research Group adalah kelompok riset di <strong className="text-foreground">
            Departemen Sains Informasi Geografi, Fakultas Geografi Universitas Gadjah Mada</strong>.
            Kami memfokuskan diri pada pemetaan dan pemantauan ekosistem pesisir — terumbu karang,
            padang lamun, dan mangrove — yang punya nilai ekologis-ekonomis besar sekaligus rentan
            terhadap tekanan iklim dan pembangunan.
          </p>
          <p>
            Karya kami berpangkal pada kebutuhan data spasial habitat perairan dangkal yang
            akurat untuk <em>ocean account</em> nasional. Kami bekerja bersama mitra industri
            seperti <strong className="text-foreground">PT Mitra Geotama Indonesia</strong> dan
            lembaga pengelola kawasan untuk menghasilkan panduan teknis yang bisa dipakai
            praktisi di lapangan.
          </p>
        </div>
      </div>
    </section>
  );
}

const PILLARS = [
  { icon: Satellite, title: "Pra-Pemrosesan Citra", body: "Koreksi atmosfer, sunglint (Hedley), dan kolom air (Lyzenga DII) pada citra multispektral Sentinel-2 / Landsat." },
  { icon: Fish, title: "Survei Lapangan", body: "Metode photo-quadrate, photo-transect, dan analisis foto (CPCe) untuk membangun sampel training-validation habitat." },
  { icon: Sprout, title: "Klasifikasi Machine Learning", body: "Random Forest dengan tuning nTree, variable selection, dan impurity — plus uji akurasi confusion matrix per skema klasifikasi." },
  { icon: LineChart, title: "Analisis Multi-Temporal", body: "Deteksi perubahan luasan dan spasial habitat lintas periode untuk memantau dinamika ekosistem pesisir." },
];

function Focus() {
  return (
    <section className="border-y border-border bg-muted/30">
      <div className="mx-auto max-w-[1400px] px-4 py-20">
        <div className="max-w-2xl">
          <div className="text-[11px] uppercase tracking-wider text-accent font-medium">02 · Fokus Riset</div>
          <h2 className="mt-2 text-3xl md:text-4xl">Empat pilar kerja kelompok riset.</h2>
          <p className="mt-3 text-muted-foreground">
            Struktur riset kami mengikuti alur SOP pemetaan habitat perairan dangkal —
            dari pra-pemrosesan citra hingga analisis multi-temporal.
          </p>
        </div>
        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PILLARS.map((p, i) => (
            <Card key={p.title} className="p-5 gap-3 border-border bg-card hover:border-accent/60 transition-colors">
              <div className="flex items-center gap-3">
                <span className="grid place-items-center h-9 w-9 rounded-md bg-accent/10 text-accent">
                  <p.icon className="h-4 w-4" />
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">0{i + 1}</span>
              </div>
              <h3 className="text-lg mt-1">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Team() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-20">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-accent font-medium">03 · Tim Peneliti</div>
          <h2 className="mt-2 text-3xl md:text-4xl">Peneliti & anggota lab.</h2>
        </div>
        <p className="text-sm text-muted-foreground max-w-md">
          {/* TODO: ganti dengan data tim asli. */}
          Foto & bio lengkap akan ditambahkan oleh tim. Nama di bawah ini adalah placeholder mengacu pada kepenulisan Panduan Teknis 2023.
        </p>
      </div>
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEAM.map((t) => (
          <Card key={t.name} className="p-5 gap-3 flex-row items-center">
            <div className="h-14 w-14 rounded-full bg-ocean-gradient shrink-0 grid place-items-center text-white text-lg font-display">
              {t.name.split(" ").slice(-1)[0][0]}
            </div>
            <div className="min-w-0">
              <div className="font-medium text-sm truncate">{t.name}</div>
              <div className="text-xs text-muted-foreground">{t.role}</div>
              <div className="text-[11px] text-accent mt-0.5">{t.field}</div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Publications() {
  return (
    <section id="publikasi" className="border-y border-border bg-muted/30">
      <div className="mx-auto max-w-[1400px] px-4 py-20">
        <div className="text-[11px] uppercase tracking-wider text-accent font-medium">04 · Publikasi & Output</div>
        <h2 className="mt-2 text-3xl md:text-4xl">Publikasi ilmiah, panduan teknis, dataset.</h2>
        <div className="mt-8 divide-y divide-border border border-border rounded-lg bg-card">
          {PUBLICATIONS.map((pub) => (
            <div key={pub.title} className="p-5 flex flex-col md:flex-row md:items-center gap-3 md:gap-6 hover:bg-muted/40">
              <div className="shrink-0 flex items-center gap-3 md:w-32">
                <span className="text-2xl font-display">{pub.year}</span>
                <Badge variant="outline" className="text-[10px]">{pub.type}</Badge>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium leading-snug">{pub.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{pub.authors}</div>
                <div className="text-[11px] text-accent mt-0.5">{pub.venue}</div>
              </div>
              <Button variant="ghost" size="sm" className="shrink-0 text-xs">
                <Download className="h-3.5 w-3.5 mr-1.5" /> Detail
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CaseStudy() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-20">
      <div className="text-[11px] uppercase tracking-wider text-accent font-medium">05 · Studi Kasus</div>
      <h2 className="mt-2 text-3xl md:text-4xl">Karimunjawa — Sentinel-2, 10 Juli 2022.</h2>
      <div className="mt-8 grid lg:grid-cols-[1.2fr_1fr] gap-6">
        <div className="relative rounded-xl border border-border overflow-hidden bg-ocean-gradient min-h-[360px]">
          <div className="absolute inset-0 bg-grid opacity-30" />
          {/* Fake classified map preview */}
          <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full">
            <defs>
              <radialGradient id="reef" cx="30%" cy="40%" r="30%">
                <stop offset="0%" stopColor="oklch(0.68 0.17 45)" stopOpacity="0.9" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              <radialGradient id="seagrass" cx="65%" cy="55%" r="25%">
                <stop offset="0%" stopColor="oklch(0.6 0.15 165)" stopOpacity="0.85" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              <radialGradient id="sand" cx="50%" cy="30%" r="18%">
                <stop offset="0%" stopColor="oklch(0.93 0.05 85)" stopOpacity="0.9" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="400" height="300" fill="url(#reef)" />
            <rect x="0" y="0" width="400" height="300" fill="url(#seagrass)" />
            <rect x="0" y="0" width="400" height="300" fill="url(#sand)" />
          </svg>
          <div className="absolute top-3 left-3 text-[10px] uppercase tracking-wider bg-black/40 text-white px-2 py-1 rounded">
            Peta klasifikasi habitat (mock)
          </div>
          <div className="absolute bottom-3 left-3 flex gap-2 flex-wrap">
            {[
              { c: "oklch(0.68 0.17 45)", l: "Terumbu" },
              { c: "oklch(0.6 0.15 165)", l: "Lamun" },
              { c: "oklch(0.55 0.2 145)", l: "Makroalga" },
              { c: "oklch(0.93 0.05 85)", l: "Pasir" },
            ].map((k) => (
              <div key={k.l} className="text-[10px] flex items-center gap-1.5 bg-black/40 text-white px-2 py-0.5 rounded">
                <span className="h-2 w-2 rounded-full" style={{ background: k.c }} /> {k.l}
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Card className="p-5 gap-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-accent" />
              <span className="font-medium">Kepulauan Karimunjawa, Jawa Tengah</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
              <Info k="Sensor" v="Sentinel-2 L2A" />
              <Info k="Tanggal" v="10 Juli 2022" />
              <Info k="Resolusi" v="10 m/piksel" />
              <Info k="Skema" v="Mayor (4 kelas)" />
              <Info k="Algoritma" v="Random Forest" />
              <Info k="Overall Accuracy" v="90.4%" />
            </div>
            <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
              Alur: koreksi sunglint (Hedley) → Ln transform → koreksi kolom air (DII)
              → band stack → mask laut dangkal optis → Random Forest (nTree 300, Gini)
              → confusion matrix.
            </p>
            <Button asChild size="sm" variant="outline" className="w-fit mt-2 text-xs">
              <Link to="/processing">
                Buka alur ini di Workbench <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </Card>
          <Card className="p-5 gap-2">
            <div className="text-[11px] text-accent uppercase tracking-wider">Ringkasan luasan (ha)</div>
            <div className="mt-2 space-y-2">
              {[
                { n: "Terumbu Karang", v: 376, max: 500, c: "oklch(0.68 0.17 45)" },
                { n: "Lamun", v: 214, max: 500, c: "oklch(0.6 0.15 165)" },
                { n: "Makroalga", v: 111, max: 500, c: "oklch(0.55 0.2 145)" },
                { n: "Pasir", v: 386, max: 500, c: "oklch(0.85 0.05 85)" },
              ].map((r) => (
                <div key={r.n}>
                  <div className="flex justify-between text-xs">
                    <span>{r.n}</span><span className="font-mono">{r.v} ha</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(r.v / r.max) * 100}%`, background: r.c }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className="font-medium">{v}</div>
    </div>
  );
}

function Gallery() {
  const items = [
    { t: "Photo-quadrate", g: "linear-gradient(135deg, oklch(0.45 0.1 200), oklch(0.6 0.12 180))" },
    { t: "Photo-transect", g: "linear-gradient(135deg, oklch(0.35 0.08 230), oklch(0.55 0.11 200))" },
    { t: "Substrat lamun", g: "linear-gradient(135deg, oklch(0.5 0.13 165), oklch(0.65 0.13 145))" },
    { t: "Deployment UAV", g: "linear-gradient(135deg, oklch(0.4 0.09 220), oklch(0.7 0.11 45))" },
    { t: "CPCe analisis", g: "linear-gradient(135deg, oklch(0.32 0.06 240), oklch(0.55 0.15 305))" },
    { t: "Field brief", g: "linear-gradient(135deg, oklch(0.45 0.09 210), oklch(0.75 0.09 90))" },
  ];
  return (
    <section className="border-y border-border bg-muted/30">
      <div className="mx-auto max-w-[1400px] px-4 py-20">
        <div className="text-[11px] uppercase tracking-wider text-accent font-medium">06 · Galeri Lapangan</div>
        <h2 className="mt-2 text-3xl md:text-4xl">Dokumentasi survei & kegiatan.</h2>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {items.map((it) => (
            <div key={it.t} className="aspect-[3/4] rounded-lg relative overflow-hidden border border-border" style={{ background: it.g }}>
              <div className="absolute inset-0 bg-grid opacity-25" />
              <div className="absolute bottom-2 left-2 right-2 text-[11px] text-white font-medium">
                {it.t}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[11px] text-muted-foreground italic">
          {/* TODO: ganti dengan foto lapangan asli. */}
          Placeholder — akan diganti dengan foto lapangan asli.
        </p>
      </div>
    </section>
  );
}

function Partners() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-16">
      <div className="text-[11px] uppercase tracking-wider text-accent font-medium">07 · Mitra & Afiliasi</div>
      <h2 className="mt-2 text-3xl md:text-4xl">Kolaborator lintas sektor.</h2>
      <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {PARTNERS.map((p) => (
          <div key={p} className="border border-border rounded-lg p-4 flex flex-col items-start gap-2 hover:border-accent/60">
            <Building2 className="h-4 w-4 text-accent" />
            <div className="text-xs font-medium leading-tight">{p}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="border-t border-border bg-ocean-deep text-white">
      <div className="mx-auto max-w-[1400px] px-4 py-20 grid md:grid-cols-2 gap-10">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-teal font-medium">08 · Kontak</div>
          <h2 className="mt-2 text-3xl md:text-4xl">Mari berkolaborasi.</h2>
          <p className="mt-4 text-white/70 max-w-md">
            Tertarik bekerja sama untuk pemetaan habitat pesisir, pelatihan, atau riset bersama?
            Hubungi kami melalui email atau formulir di samping.
          </p>
          <div className="mt-6 space-y-2 text-sm">
            <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-teal" /> Fakultas Geografi UGM, Sekip Utara, Sleman, DIY 55281</div>
            <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-teal" /> bluecarbon@geo.ugm.ac.id</div>
            <div className="flex items-center gap-3"><GraduationCap className="h-4 w-4 text-teal" /> Departemen Sains Informasi Geografi</div>
          </div>
        </div>
        <form className="rounded-xl border border-white/15 bg-white/5 backdrop-blur p-6 space-y-3" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-2 gap-3">
            <input className="h-10 rounded-md bg-white/10 border border-white/20 px-3 text-sm placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-teal" placeholder="Nama" />
            <input className="h-10 rounded-md bg-white/10 border border-white/20 px-3 text-sm placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-teal" placeholder="Institusi" />
          </div>
          <input className="h-10 w-full rounded-md bg-white/10 border border-white/20 px-3 text-sm placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-teal" placeholder="Email" />
          <textarea rows={4} className="w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 text-sm placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-teal" placeholder="Pesan / topik kolaborasi" />
          <Button type="submit" className="bg-teal text-ocean-deep hover:bg-teal/90 w-full">Kirim pesan</Button>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-ocean-deep text-white/60">
      <div className="mx-auto max-w-[1400px] px-4 py-6 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Layers className="h-3.5 w-3.5" />
          © {new Date().getFullYear()} Blue Carbon Research Group — Fakultas Geografi UGM
        </div>
        <div>
          Referensi metode: Harahap et al., <em>Panduan Teknis</em> (2023).
        </div>
      </div>
    </footer>
  );
}
