/**
 * UI-chrome translations only - nav, section eyebrows/titles/descriptions,
 * form labels, buttons, footer. Content authored in /admin (headlines, team
 * bios, publication titles, ...) is free-text CMS data and is NOT
 * translated here; it renders exactly as the admin typed it regardless of
 * the selected language. See AGENTS.md "Bahasa" section.
 */

export type Locale = "id" | "en";

export const LOCALES: Locale[] = ["id", "en"];

const dictionaries = {
  id: {
    "nav.tagline": "Fakultas Geografi · Universitas Gadjah Mada",
    "nav.language": "Bahasa",

    "hero.ctaPrimary": "Coba alur kerja pemetaan",
    "hero.ctaSecondary": "Lihat publikasi",

    "about.eyebrow": "Tentang",

    "focus.eyebrow": "Fokus Riset",
    "focus.title": "Pilar kerja kelompok riset.",
    "focus.description":
      "Struktur riset kami mengikuti alur SOP pemetaan habitat perairan dangkal, dari pra-pemrosesan citra hingga analisis multi-temporal.",

    "team.eyebrow": "Tim Peneliti",
    "team.title": "Peneliti & anggota lab.",
    "team.description":
      "Peneliti dan asisten riset lintas bidang (penginderaan jauh pesisir, machine learning, fotogrametri, dan survei lapangan).",
    "team.membersUnit": "anggota",
    "team.email": "Email",
    "team.scholar": "Scholar",

    "publications.eyebrow": "Publikasi & Output",
    "publications.title": "Publikasi ilmiah, panduan teknis, dataset.",
    "publications.entriesUnit": "entri",

    "gallery.eyebrow": "Galeri Lapangan",
    "gallery.title": "Dokumentasi survei & kegiatan.",

    "partners.eyebrow": "Mitra & Afiliasi",
    "partners.title": "Kolaborator lintas sektor.",

    "contact.eyebrow": "Kontak",
    "contact.title": "Mari berkolaborasi.",
    "contact.intro":
      "Tertarik bekerja sama untuk pemetaan habitat pesisir, pelatihan, atau riset bersama? Hubungi kami melalui email atau formulir di samping.",
    "contact.address": "Alamat",
    "contact.email": "Email",
    "contact.phone": "Telepon",
    "contact.department": "Departemen",
    "contact.formName": "Nama",
    "contact.formInstitution": "Institusi",
    "contact.formEmail": "Email",
    "contact.formMessage": "Pesan / topik kolaborasi",
    "contact.formSubmit": "Kirim pesan",
    "contact.formHint": "Tombol ini membuka aplikasi email Anda dengan pesan yang sudah terisi.",
    "contact.emailSubjectPrefix": "Kolaborasi",
    "contact.emailNoName": "Tanpa nama",

    "footer.updated": "Diperbarui",

    "processing.notReadyEyebrow": "Layar terlalu sempit",
    "processing.notReadyTitle": "Buka Processing di layar lebih lebar",
    "processing.notReadyBody":
      "Workbench node-based dirancang untuk layar desktop/tablet lebar (≥1024 px) agar palette, kanvas, dan property panel bisa tampil bersamaan.",
    "processing.loading": "Memuat workbench…",
  },
  en: {
    "nav.tagline": "Faculty of Geography · Universitas Gadjah Mada",
    "nav.language": "Language",

    "hero.ctaPrimary": "Try the mapping workflow",
    "hero.ctaSecondary": "View publications",

    "about.eyebrow": "About",

    "focus.eyebrow": "Research Focus",
    "focus.title": "Four pillars of the group's work.",
    "focus.description":
      "Our research follows the shallow-water habitat mapping SOP, from image pre-processing through multi-temporal analysis.",

    "team.eyebrow": "Research Team",
    "team.title": "Researchers & lab members.",
    "team.description":
      "Researchers and research assistants across disciplines (coastal remote sensing, machine learning, photogrammetry, and field survey).",
    "team.membersUnit": "members",
    "team.email": "Email",
    "team.scholar": "Scholar",

    "publications.eyebrow": "Publications & Output",
    "publications.title": "Papers, technical guides, datasets.",
    "publications.entriesUnit": "entries",

    "gallery.eyebrow": "Field Gallery",
    "gallery.title": "Survey & fieldwork documentation.",

    "partners.eyebrow": "Partners & Affiliations",
    "partners.title": "Collaborators across sectors.",

    "contact.eyebrow": "Contact",
    "contact.title": "Let's collaborate.",
    "contact.intro":
      "Interested in working together on coastal habitat mapping, training, or joint research? Reach us by email or the form alongside.",
    "contact.address": "Address",
    "contact.email": "Email",
    "contact.phone": "Phone",
    "contact.department": "Department",
    "contact.formName": "Name",
    "contact.formInstitution": "Institution",
    "contact.formEmail": "Email",
    "contact.formMessage": "Message / collaboration topic",
    "contact.formSubmit": "Send message",
    "contact.formHint": "This button opens your email app with the message pre-filled.",
    "contact.emailSubjectPrefix": "Collaboration",
    "contact.emailNoName": "No name given",

    "footer.updated": "Updated",

    "processing.notReadyEyebrow": "Screen too narrow",
    "processing.notReadyTitle": "Open Processing on a wider screen",
    "processing.notReadyBody":
      "The node-based workbench is built for desktop/tablet-wide screens (≥1024px) so the palette, canvas, and property panel can all show at once.",
    "processing.loading": "Loading workbench…",
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type TranslationKey = keyof (typeof dictionaries)["id"];

export function translate(locale: Locale, key: TranslationKey): string {
  return dictionaries[locale][key] ?? dictionaries.id[key] ?? key;
}
