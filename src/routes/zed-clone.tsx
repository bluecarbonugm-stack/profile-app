import { createFileRoute } from "@tanstack/react-router";
import { ZedClonePage } from "@/features/zed-clone";

export const Route = createFileRoute("/zed-clone")({
  head: () => ({
    meta: [
      { title: "Zed clone - design reference" },
      {
        name: "description",
        content: "Signature-section design clone of zed.dev, built from zed-dev-uiux-brief.md.",
      },
      { property: "og:title", content: "Zed clone - design reference" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return <ZedClonePage />;
}
