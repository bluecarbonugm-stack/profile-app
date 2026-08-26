import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { getSite, updateSite } from "@/features/profile/api/admin-content";

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

  const field = (label: string, key: keyof SiteRow, type = "text") => (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={(form[key] as string) ?? ""}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#0B409C] focus:outline-none focus:ring-1 focus:ring-[#0B409C]"
      />
    </div>
  );

  if (isLoading) return <p className="text-sm text-gray-500">Memuat...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#10316B]">Site Info</h1>
      <div className="mt-6 space-y-4">
        {field("Organization Name", "organization_name")}
        {field("Faculty", "faculty")}
        {field("Department", "department")}
        {field("Badge", "badge")}
        {field("Headline", "headline")}
        {field("Headline Emphasis", "headline_emphasis")}
        {field("Headline Suffix", "headline_suffix")}
        {field("Intro", "intro")}
        {field("About Title", "about_title")}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            About Paragraphs (satu paragraf per baris)
          </label>
          <textarea
            value={(form.about_paragraphs ?? []).join("\n")}
            onChange={(e) => setForm({ ...form, about_paragraphs: e.target.value.split("\n") })}
            rows={4}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#0B409C] focus:outline-none focus:ring-1 focus:ring-[#0B409C]"
          />
        </div>
        {field("Address", "address")}
        {field("Email", "email", "email")}
        {field("Phone", "phone")}
        {field("Maps URL", "maps_url", "url")}
        {field("Hero Image URL", "hero_image", "url")}
        {field("Founded Year", "founded_year")}
      </div>
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() => saveMut.mutate()}
          disabled={saveMut.isPending}
          className="rounded-md bg-[#0B409C] px-4 py-2 text-sm font-medium text-white hover:bg-[#0B409C]/90 disabled:opacity-50"
        >
          {saveMut.isPending ? "Menyimpan..." : "Simpan"}
        </button>
        {saveMut.isSuccess && <span className="text-sm text-green-600">Tersimpan!</span>}
        {saveMut.isError && <span className="text-sm text-red-600">Gagal menyimpan</span>}
      </div>
    </div>
  );
}
