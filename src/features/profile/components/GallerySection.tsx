import { MapPin } from "lucide-react";

import { Section, SectionHeader } from "@/shared/components/layout/section";
import { resolveImageUrl } from "../data/media";
import type { GalleryItem } from "../types";

// Deterministic tints for items without a photo, so a half-filled gallery still
// looks intentional instead of like a broken image grid.
const PLACEHOLDER_TINTS = [
  "linear-gradient(135deg, oklch(0.45 0.1 200), oklch(0.6 0.12 180))",
  "linear-gradient(135deg, oklch(0.35 0.08 230), oklch(0.55 0.11 200))",
  "linear-gradient(135deg, oklch(0.5 0.13 165), oklch(0.65 0.13 145))",
  "linear-gradient(135deg, oklch(0.4 0.09 220), oklch(0.7 0.11 45))",
  "linear-gradient(135deg, oklch(0.32 0.06 240), oklch(0.55 0.15 305))",
  "linear-gradient(135deg, oklch(0.45 0.09 210), oklch(0.75 0.09 90))",
];

export function GallerySection({ index, items }: { index: number; items: GalleryItem[] }) {
  return (
    <Section id="galeri" tone="muted">
      <SectionHeader
        index={index}
        eyebrow="Galeri Lapangan"
        title="Dokumentasi survei & kegiatan."
      />

      <ul className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {items.map((item, i) => {
          const image = resolveImageUrl(item.image, 600);
          return (
            <li key={item.title}>
              <figure
                className="group relative aspect-[3/4] overflow-hidden rounded-lg border border-border"
                style={
                  image
                    ? undefined
                    : { background: PLACEHOLDER_TINTS[i % PLACEHOLDER_TINTS.length] }
                }
              >
                {image ? (
                  <img
                    src={image}
                    alt={item.caption ?? item.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div aria-hidden="true" className="absolute inset-0 bg-grid opacity-25" />
                )}

                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-10">
                  <span className="block text-[11px] font-medium leading-tight text-white">
                    {item.title}
                  </span>
                  {item.location && (
                    <span className="mt-1 flex items-center gap-1 text-[10px] text-white/65">
                      <MapPin className="h-2.5 w-2.5" /> {item.location}
                    </span>
                  )}
                </figcaption>
              </figure>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
