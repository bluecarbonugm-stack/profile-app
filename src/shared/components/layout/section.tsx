import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";
import { useReveal } from "@/shared/hooks/use-reveal";

/**
 * Page-level layout primitives.
 *
 * Every band on the site is a <Section>, and every section is introduced by a
 * <SectionHeader>. Before this existed each section hand-rolled its own
 * max-width, padding, eyebrow markup and heading size, and they had already
 * drifted apart. Changing the rhythm of the page should be one edit here.
 */

type Tone = "default" | "muted" | "deep";

const TONE_CLASS: Record<Tone, string> = {
  default: "bg-background",
  // Alternating band. The top border is what separates it from the section
  // above; sections never carry their own bottom border, so two adjacent
  // muted bands cannot produce a double rule.
  muted: "border-y border-border bg-muted/30",
  deep: "border-t border-border bg-ocean-deep text-white",
};

export function Section({
  id,
  tone = "default",
  className,
  containerClassName,
  children,
}: {
  id?: string;
  tone?: Tone;
  className?: string;
  containerClassName?: string;
  children: ReactNode;
}) {
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section
      id={id}
      ref={ref}
      className={cn("reveal", visible && "reveal-visible", TONE_CLASS[tone], className)}
    >
      <div className={cn("mx-auto w-full max-w-[1200px] px-6 py-20 md:py-28", containerClassName)}>
        {children}
      </div>
    </section>
  );
}

/**
 * The monospace index + label above a heading ("03 · Tim Peneliti").
 * `index` is optional so the same treatment works for unnumbered labels.
 */
export function Eyebrow({
  index,
  children,
  className,
}: {
  index?: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("eyebrow flex items-center gap-2 text-primary", className)}>
      {index !== undefined && (
        <>
          <span className="tabular opacity-70">{String(index).padStart(2, "0")}</span>
          <span aria-hidden="true" className="h-px w-4 bg-current opacity-40" />
        </>
      )}
      {children}
    </p>
  );
}

/**
 * Eyebrow + title + optional description, with an optional `aside` that sits
 * to the right on wide screens (used for section-level counts and notes).
 */
export function SectionHeader({
  index,
  eyebrow,
  title,
  description,
  aside,
  className,
}: {
  index?: number;
  eyebrow: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12",
        className,
      )}
    >
      <div className="max-w-2xl">
        <Eyebrow index={index}>{eyebrow}</Eyebrow>
        <h2 className="mt-4 text-3xl leading-[1.15] md:text-[2.5rem]">{title}</h2>
        {description && (
          <p className="measure mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            {description}
          </p>
        )}
      </div>
      {aside && <div className="shrink-0 lg:max-w-xs lg:text-right">{aside}</div>}
    </div>
  );
}
