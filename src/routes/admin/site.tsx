import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { getSite, updateSite } from "@/features/profile/api/admin-content";
import { Button } from "@/shared/components/ui/button";
import {
  SaveStatus,
  TextAreaField,
  TextField,
} from "@/features/profile/components/admin/admin-field";

export const Route = createFileRoute("/admin/site")({
  component: AdminSite,
});

interface SiteRow {
  id: string;
  organization_name: string;
  faculty: string;
  department: string;
  badge: string;
  headline: string;
  headline_emphasis: string;
  headline_suffix: string;
  intro: string;
  about_title: string;
  about_paragraphs: string[];
  address: string;
  email: string;
  phone: string;
  maps_url: string;
  hero_image: string;
  founded_year: string;
}

function AdminSite() {
  const qc = useQueryClient();
  const { data: site, isLoading } = useQuery({
    queryKey: ["admin", "site"],
    queryFn: () => getSite({ data: undefined }),
  });

  const [form, setForm] = useState<Partial<SiteRow>>({});

  useEffect(() => {
    if (site) setForm(site as SiteRow);
  }, [site]);

  const saveMut = useMutation({
    mutationFn: () => {
      const { id: _id, ...updates } = form;
      return updateSite({ data: updates });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "site"] }),
  });

  const set = (key: keyof SiteRow) => (value: string) => setForm({ ...form, [key]: value });

  if (isLoading) return <p className="text-sm text-muted-foreground">Memuat…</p>;

  return (
    <div>
      <h1 className="text-2xl font-display">Site Info</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <TextField
          label="Organization Name"
          value={form.organization_name ?? ""}
          onChange={set("organization_name")}
        />
        <TextField label="Faculty" value={form.faculty ?? ""} onChange={set("faculty")} />
        <TextField label="Department" value={form.department ?? ""} onChange={set("department")} />
        <TextField label="Badge" value={form.badge ?? ""} onChange={set("badge")} />
        <TextField label="Headline" value={form.headline ?? ""} onChange={set("headline")} />
        <TextField
          label="Headline Emphasis"
          value={form.headline_emphasis ?? ""}
          onChange={set("headline_emphasis")}
        />
        <TextField
          label="Headline Suffix"
          value={form.headline_suffix ?? ""}
          onChange={set("headline_suffix")}
        />
        <TextField
          label="Founded Year"
          value={form.founded_year ?? ""}
          onChange={set("founded_year")}
        />
        <div className="sm:col-span-2">
          <TextAreaField label="Intro" value={form.intro ?? ""} onChange={set("intro")} rows={2} />
        </div>
        <div className="sm:col-span-2">
          <TextField
            label="About Title"
            value={form.about_title ?? ""}
            onChange={set("about_title")}
          />
        </div>
        <div className="sm:col-span-2">
          <TextAreaField
            label="About Paragraphs"
            hint="Satu paragraf per baris."
            value={(form.about_paragraphs ?? []).join("\n")}
            onChange={(v) => setForm({ ...form, about_paragraphs: v.split("\n") })}
          />
        </div>
        <TextField label="Address" value={form.address ?? ""} onChange={set("address")} />
        <TextField label="Email" type="email" value={form.email ?? ""} onChange={set("email")} />
        <TextField label="Phone" value={form.phone ?? ""} onChange={set("phone")} />
        <TextField
          label="Maps URL"
          type="url"
          value={form.maps_url ?? ""}
          onChange={set("maps_url")}
        />
        <TextField
          label="Hero Image URL"
          type="url"
          value={form.hero_image ?? ""}
          onChange={set("hero_image")}
        />
      </div>
      <div className="mt-6 flex items-center gap-3">
        <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
          {saveMut.isPending ? "Menyimpan…" : "Simpan"}
        </Button>
        <SaveStatus
          isPending={saveMut.isPending}
          isSuccess={saveMut.isSuccess}
          isError={saveMut.isError}
        />
      </div>
    </div>
  );
}
