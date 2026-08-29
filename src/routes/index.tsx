import { createFileRoute } from "@tanstack/react-router";
import { getProfileContent, ProfilePage } from "@/features/profile";

export const Route = createFileRoute("/")({
  // Runs on the server during SSR (and as an RPC on client navigation) so the
  // real content is in the rendered HTML for crawlers, not just fetched
  // client-side after hydration.
  loader: () => getProfileContent(),
  head: () => ({
    meta: [
      { title: "Blue Carbon Research Group - Fakultas Geografi UGM" },
      {
        name: "description",
        content:
          "Kelompok riset UGM yang memetakan habitat perairan laut dangkal - terumbu karang, lamun, mangrove - dengan penginderaan jauh dan machine learning.",
      },
      { property: "og:title", content: "Blue Carbon Research Group - Fakultas Geografi UGM" },
      {
        property: "og:description",
        content:
          "Pemetaan ekosistem blue carbon Indonesia menggunakan citra satelit dan Random Forest.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const payload = Route.useLoaderData();
  return <ProfilePage payload={payload} />;
}
