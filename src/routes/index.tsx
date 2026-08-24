import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/features/profile/components/ProfilePage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Blue Carbon Research Group — Fakultas Geografi UGM" },
      { name: "description", content: "Kelompok riset UGM yang memetakan habitat perairan laut dangkal — terumbu karang, lamun, mangrove — dengan penginderaan jauh dan machine learning." },
      { property: "og:title", content: "Blue Carbon Research Group — Fakultas Geografi UGM" },
      { property: "og:description", content: "Pemetaan ekosistem blue carbon Indonesia menggunakan citra satelit dan Random Forest." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});
