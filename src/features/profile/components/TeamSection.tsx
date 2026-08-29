import { GraduationCap, Mail } from "lucide-react";

import { Section, SectionHeader } from "@/shared/components/layout/section";
import { initialsOf, resolveImageUrl } from "../data/media";
import type { TeamMember } from "../types";

export function TeamSection({ index, members }: { index: number; members: TeamMember[] }) {
  return (
    <Section id="tim">
      <SectionHeader
        index={index}
        eyebrow="Tim Peneliti"
        title="Peneliti & anggota lab."
        description="Peneliti dan asisten riset lintas bidang (penginderaan jauh pesisir, machine learning, fotogrametri, dan survei lapangan)."
        aside={
          <p className="eyebrow text-muted-foreground">
            <span className="tabular">{String(members.length).padStart(2, "0")}</span> anggota
          </p>
        }
      />

      <ul className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <TeamCard key={member.name} member={member} />
        ))}
      </ul>
    </Section>
  );
}

function TeamCard({ member }: { member: TeamMember }) {
  const photo = resolveImageUrl(member.photo, 320);

  return (
    <li className="flex gap-4 bg-card p-6 transition-colors hover:bg-muted/40">
      {photo ? (
        <img
          src={photo}
          alt={member.name}
          loading="lazy"
          className="h-14 w-14 shrink-0 rounded-full object-cover ring-1 ring-border"
        />
      ) : (
        <div
          aria-hidden="true"
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-ocean-gradient font-display text-lg text-white"
        >
          {initialsOf(member.name)}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-medium leading-snug">{member.name}</h3>
        {member.role && <p className="mt-1 text-xs text-muted-foreground">{member.role}</p>}
        {member.field && <p className="eyebrow mt-2 text-accent">{member.field}</p>}
        {member.bio && (
          <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
            {member.bio}
          </p>
        )}

        {(member.email || member.scholarUrl) && (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-accent"
              >
                <Mail className="h-3 w-3" /> Email
              </a>
            )}
            {member.scholarUrl && (
              <a
                href={member.scholarUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-accent"
              >
                <GraduationCap className="h-3 w-3" /> Scholar
              </a>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
