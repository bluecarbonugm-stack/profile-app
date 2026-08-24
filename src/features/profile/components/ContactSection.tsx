import { useState } from "react";
import { GraduationCap, Mail, MapPin, Phone } from "lucide-react";

import { Section, Eyebrow } from "@/shared/components/layout/section";
import { Button } from "@/shared/components/ui/button";
import type { SiteInfo } from "../types";

export function ContactSection({ index, site }: { index: number; site: SiteInfo }) {
  return (
    <Section id="kontak" tone="deep">
      <div className="grid gap-12 md:grid-cols-2 md:gap-16">
        <div>
          <Eyebrow index={index} className="text-teal">
            Kontak
          </Eyebrow>
          <h2 className="mt-4 text-3xl leading-[1.15] md:text-[2.5rem]">Mari berkolaborasi.</h2>
          <p className="measure mt-4 text-sm leading-relaxed text-white/65 md:text-base">
            Tertarik bekerja sama untuk pemetaan habitat pesisir, pelatihan, atau riset bersama?
            Hubungi kami melalui email atau formulir di samping.
          </p>

          <dl className="mt-10 space-y-4 border-t border-white/15 pt-8 text-sm">
            {site.address && (
              <ContactRow icon={MapPin} label="Alamat" href={site.mapsUrl}>
                {site.address}
              </ContactRow>
            )}
            {site.email && (
              <ContactRow icon={Mail} label="Email" href={`mailto:${site.email}`}>
                {site.email}
              </ContactRow>
            )}
            {site.phone && (
              <ContactRow
                icon={Phone}
                label="Telepon"
                href={`tel:${site.phone.replace(/\s+/g, "")}`}
              >
                {site.phone}
              </ContactRow>
            )}
            {site.department && (
              <ContactRow icon={GraduationCap} label="Departemen">
                {site.department}
              </ContactRow>
            )}
          </dl>
        </div>

        <ContactForm recipient={site.email} />
      </div>
    </Section>
  );
}

function ContactRow({
  icon: Icon,
  label,
  href,
  children,
}: {
  icon: React.ElementType;
  label: string;
  href?: string;
  children: React.ReactNode;
}) {
  const isExternal = href?.startsWith("http");

  return (
    <div className="flex gap-3">
      <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
      <div className="min-w-0">
        <dt className="eyebrow text-white/40">{label}</dt>
        <dd className="mt-1 text-white/85">
          {href ? (
            <a
              href={href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noreferrer noopener" : undefined}
              className="link-rule transition-colors hover:text-teal"
            >
              {children}
            </a>
          ) : (
            children
          )}
        </dd>
      </div>
    </div>
  );
}

/**
 * There is no backend to accept form posts, so instead of a submit button that
 * silently discards what someone typed, this composes a pre-filled email and
 * hands it to their mail client. It works everywhere and loses nothing.
 */
function ContactForm({ recipient }: { recipient?: string }) {
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!recipient) return;

    const subject = `Kolaborasi: ${name || "Tanpa nama"}${institution ? ` (${institution})` : ""}`;
    const body = [
      `Nama: ${name}`,
      `Institusi: ${institution}`,
      `Email: ${email}`,
      "",
      message,
    ].join("\n");

    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form
      className="flex flex-col gap-5 rounded-lg border border-white/15 bg-white/[0.04] p-6 backdrop-blur-sm md:p-8"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nama" required value={name} onChange={setName} />
        <Field label="Institusi" value={institution} onChange={setInstitution} />
      </div>
      <Field label="Email" type="email" required value={email} onChange={setEmail} />
      <Field
        label="Pesan / topik kolaborasi"
        required
        multiline
        value={message}
        onChange={setMessage}
      />

      <Button
        type="submit"
        disabled={!recipient}
        className="mt-1 bg-teal text-ocean-deep hover:bg-teal/90"
      >
        Kirim pesan
      </Button>
      <p className="text-xs leading-relaxed text-white/45">
        Tombol ini membuka aplikasi email Anda dengan pesan yang sudah terisi.
      </p>
    </form>
  );
}

const FIELD_CLASS =
  "w-full rounded-md border border-white/20 bg-white/[0.06] px-3 text-sm text-white transition-colors placeholder:text-white/35 hover:border-white/35";

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  multiline?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="eyebrow text-white/45">{label}</span>
      {multiline ? (
        <textarea
          rows={4}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${FIELD_CLASS} resize-y py-2.5`}
        />
      ) : (
        <input
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${FIELD_CLASS} h-10`}
        />
      )}
    </label>
  );
}
