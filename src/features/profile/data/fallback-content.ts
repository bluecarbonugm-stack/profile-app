import type { ProfileContent } from "../types";

/**
 * Content the profile page renders when the spreadsheet is unreachable or not
 * configured yet. Keep it truthful and complete enough to be publishable on its
 * own - this is what visitors see during a Google outage.
 *
 * Team names below trace the authorship of the 2023 Panduan Teknis and are
 * placeholders until the `team` sheet is filled in; the sheet always wins.
 */
export const FALLBACK_CONTENT: ProfileContent = {
  site: {
    organizationName: "Blue Carbon Research Group",
    faculty: "Fakultas Geografi UGM",
    department: "Departemen Sains Informasi Geografi",
    badge: "Fakultas Geografi UGM",
    headline: "Memetakan ekosistem",
    headlineEmphasis: "blue carbon",
    headlineSuffix: "Indonesia dengan penginderaan jauh dan machine learning.",
    intro:
      "Blue Carbon Research Group meneliti habitat perairan laut dangkal (terumbu karang, lamun, dan mangrove) menggabungkan citra satelit multispektral, survei lapangan, dan klasifikasi Random Forest untuk mendukung ocean accounting nasional.",
    aboutTitle: "Riset yang berpijak pada laut Indonesia.",
    aboutParagraphs: [
      "Blue Carbon Research Group adalah kelompok riset di Departemen Sains Informasi Geografi, Fakultas Geografi Universitas Gadjah Mada. Kami memfokuskan diri pada pemetaan dan pemantauan ekosistem pesisir (terumbu karang, padang lamun, dan mangrove) yang punya nilai ekologis-ekonomis besar sekaligus rentan terhadap tekanan iklim dan pembangunan.",
      "Karya kami berpangkal pada kebutuhan data spasial habitat perairan dangkal yang akurat untuk ocean account nasional. Kami bekerja bersama mitra industri seperti PT Mitra Geotama Indonesia dan lembaga pengelola kawasan untuk menghasilkan panduan teknis yang bisa dipakai praktisi di lapangan.",
    ],
    address: "Fakultas Geografi UGM, Sekip Utara, Sleman, DIY 55281",
    email: "bluecarbon@geo.ugm.ac.id",
    phone: undefined,
    mapsUrl: undefined,
    heroImage: undefined,
    foundedYear: "2018",
  },

  stats: [
    { value: "12+", label: "Publikasi & panduan teknis", order: 1 },
    { value: "5", label: "Wilayah studi kasus", order: 2 },
    { value: "90.4%", label: "Akurasi klasifikasi Karimunjawa", order: 3 },
    { value: "2018", label: "Tahun berdiri", order: 4 },
  ],

  focus: [
    {
      icon: "satellite",
      title: "Pra-Pemrosesan Citra",
      body: "Koreksi atmosfer, sunglint (Hedley), dan kolom air (Lyzenga DII) pada citra multispektral Sentinel-2 / Landsat.",
      order: 1,
    },
    {
      icon: "fish",
      title: "Survei Lapangan",
      body: "Metode photo-quadrate, photo-transect, dan analisis foto (CPCe) untuk membangun sampel training-validation habitat.",
      order: 2,
    },
    {
      icon: "sprout",
      title: "Klasifikasi Machine Learning",
      body: "Random Forest dengan tuning nTree, variable selection, dan impurity, plus uji akurasi confusion matrix per skema klasifikasi.",
      order: 3,
    },
    {
      icon: "chart",
      title: "Analisis Multi-Temporal",
      body: "Deteksi perubahan luasan dan spasial habitat lintas periode untuk memantau dinamika ekosistem pesisir.",
      order: 4,
    },
  ],

  team: [
    {
      name: "Prof. Dr. Pramaditya Wicaksono",
      role: "Principal Investigator",
      field: "Coastal remote sensing",
      order: 1,
    },
    {
      name: "Dr. Rifky Ardiyanto",
      role: "Senior Researcher",
      field: "Machine learning & GIS",
      order: 2,
    },
    { name: "Sinta D. Harahap, M.Sc.", role: "Researcher", field: "Habitat mapping", order: 3 },
    { name: "F. Firdausman, M.Sc.", role: "Researcher", field: "Photogrammetry & UAV", order: 4 },
    { name: "Julian Wijaya, M.Sc.", role: "Researcher", field: "Field survey lead", order: 5 },
    { name: "Nadia Salsabila", role: "Research Assistant", field: "Data pipeline", order: 6 },
  ],

  publications: [
    {
      year: "2023",
      type: "Technical Guide",
      title:
        "Panduan Teknis Survei dan Pemetaan Habitat Perairan Laut Dangkal Menggunakan Citra Penginderaan Jauh dan Klasifikasi Machine Learning",
      authors: "Harahap, S. D., Firdausman, F., Wijaya, J., Wicaksono, P., & Ardiyanto, R.",
      venue: "Blue Carbon Research Group, UGM & PT Mitra Geotama Indonesia",
      order: 1,
    },
    {
      year: "2022",
      type: "Journal",
      title:
        "Random Forest classification of shallow-water benthic habitats using Sentinel-2 imagery in Karimunjawa Islands",
      authors: "Wicaksono, P. et al.",
      venue: "Remote Sensing",
      order: 2,
    },
    {
      year: "2021",
      type: "Proceedings",
      title: "Depth-invariant index optimization for seagrass mapping in Indonesian shallow waters",
      authors: "Ardiyanto, R. et al.",
      venue: "IGARSS 2021",
      order: 3,
    },
    {
      year: "2020",
      type: "Report",
      title: "Blue carbon accounting framework for Indonesian coastal management",
      authors: "Blue Carbon Research Group",
      venue: "Technical Report",
      order: 4,
    },
  ],

  gallery: [
    { title: "Photo-quadrate", caption: "Pengambilan sampel substrat dasar perairan.", order: 1 },
    { title: "Photo-transect", caption: "Transek foto sepanjang garis survei.", order: 2 },
    { title: "Substrat lamun", caption: "Identifikasi kerapatan padang lamun.", order: 3 },
    {
      title: "Deployment UAV",
      caption: "Akuisisi citra resolusi tinggi kawasan pesisir.",
      order: 4,
    },
    { title: "Analisis CPCe", caption: "Klasifikasi tutupan dasar dari foto lapangan.", order: 5 },
    { title: "Field brief", caption: "Persiapan tim sebelum survei lapangan.", order: 6 },
  ],

  partners: [
    { name: "Fakultas Geografi UGM", order: 1 },
    { name: "PT Mitra Geotama Indonesia", order: 2 },
    { name: "KKP Republik Indonesia", order: 3 },
    { name: "BRIN", order: 4 },
    { name: "Balai Taman Nasional Karimunjawa", order: 5 },
    { name: "PUSPICS", order: 6 },
  ],

  updatedAt: undefined,
};
