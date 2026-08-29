import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { BrandMark } from "@/shared/components/brand/brand-mark";
import { SafeImage } from "@/shared/components/media/safe-image";
import { resolveImageUrl } from "../data/media";
import type { SiteInfo, Stat } from "../types";

export function HeroSection({ site, stats }: { site: SiteInfo; stats: Stat[] }) {
  const heroImage = resolveImageUrl(site.heroImage, 1920);
  const logo = resolveImageUrl(site.logoUrl, 160);

  return (
    <section className="relative isolate overflow-hidden bg-ocean-deep text-white">
      {heroImage && (
        <SafeImage
          src={heroImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-35"
          fallback={null}
        />
      )}
      <div className="absolute inset-0 -z-10 bg-ocean-gradient opacity-90" />
      <div className="absolute inset-0 -z-10 bg-grid opacity-20" />

      <div className="mx-auto w-full max-w-[1200px] animate-in fade-in slide-in-from-bottom-3 px-6 py-24 duration-700 md:py-36">
        <div className="flex items-center gap-3">
          <span
            aria-hidden={!logo}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm"
          >
            {logo ? (
              <SafeImage
                src={logo}
                alt={site.organizationName}
                className="h-7 w-7 object-contain"
                fallback={<BrandMark className="h-6 w-6 text-sand" />}
              />
            ) : (
              <BrandMark className="h-6 w-6 text-sand" />
            )}
          </span>
          {site.badge && (
            <p className="eyebrow flex items-center gap-2.5 text-accent">
              <span aria-hidden="true" className="h-px w-6 bg-current opacity-50" />
              {site.badge}
            </p>
          )}
        </div>

        <h1 className="mt-6 max-w-4xl text-[2.75rem] leading-[1.05] md:text-6xl lg:text-7xl">
          {site.headline}
          {site.headlineEmphasis && (
            <>
              {" "}
              <em className="text-sand">{site.headlineEmphasis}</em>
            </>
          )}
          {site.headlineSuffix && ` ${site.headlineSuffix}`}
        </h1>

        {site.intro && (
          <p className="measure mt-8 text-base leading-relaxed text-white/75 md:text-lg">
            {site.intro}
          </p>
        )}

        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild size="lg" className="bg-white text-ocean-deep hover:bg-white/90">
            <Link to="/processing">
              Coba alur kerja pemetaan <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/25 text-white hover:border-white/50 hover:bg-white/10"
          >
            <a href="#publikasi">Lihat publikasi</a>
          </Button>
        </div>

        {stats.length > 0 && (
          <dl className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/15 bg-white/15 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-ocean-deep/60 px-5 py-6 backdrop-blur-sm">
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="tabular block font-display text-3xl md:text-4xl">
                    {stat.value}
                  </span>
                  <span className="mt-2 block text-xs leading-snug text-white/60">
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
