import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { galleryCrud, uploadImage } from "@/features/profile/api/admin-content";

export const Route = createFileRoute("/admin/gallery")({
  component: AdminGallery,
});

interface Row {
  id: string;
  title: string;
  caption: string;
  image_url: string;
  sort_order: number;
}

const EMPTY = { title: "", caption: "", image_url: "", sort_order: 0 };

function AdminGallery() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Row> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: rows = [] } = useQuery({
    queryKey: ["admin", "gallery"],
    queryFn: () => galleryCrud.list({ data: undefined }),
  });

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      let imageUrl = editing.image_url;
      if (imageFile) {
        const b64 = await fileToBase64(imageFile);
        const res = await uploadImage({
          data: {
            section: "gallery",
            fileBase64: b64,
            fileName: imageFile.name,
            fileType: imageFile.type,
          },
        });
        imageUrl = res.url;
      }
      const payload = { ...editing, image_url: imageUrl };
      if (isNew) await galleryCrud.create({ data: payload });
      else await galleryCrud.update({ data: { id: editing.id!, updates: payload } });
    },
    onSuccess: () => {
      setEditing(null);
      setIsNew(false);
      setImageFile(null);
      qc.invalidateQueries({ queryKey: ["admin", "gallery"] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => galleryCrud.remove({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "gallery"] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#10316B]">Galeri</h1>
        <button
          onClick={() => {
            setEditing({ ...EMPTY, sort_order: rows.length + 1 });
            setIsNew(true);
          }}
          className="rounded-md bg-[#0B409C] px-3 py-1.5 text-sm text-white hover:bg-[#0B409C]/90"
        >
          + Tambah
        </button>
      </div>
      {editing && (
        <div className="mt-4 rounded-lg border bg-white p-4 shadow-sm">
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Judul"
              value={editing.title ?? ""}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              className="rounded border px-3 py-2 text-sm"
            />
            <input
              placeholder="Caption"
              value={editing.caption ?? ""}
              onChange={(e) => setEditing({ ...editing, caption: e.target.value })}
              className="rounded border px-3 py-2 text-sm"
            />
            <div className="col-span-2">
              <label className="block text-xs text-gray-500">Gambar</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                className="mt-1 text-sm"
              />
              {editing.image_url && !imageFile && (
                <img
                  src={editing.image_url}
                  alt=""
                  className="mt-2 h-16 w-16 rounded object-cover"
                />
              )}
            </div>
            <input
              type="number"
              placeholder="Urutan"
              value={editing.sort_order ?? 0}
              onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
              className="rounded border px-3 py-2 text-sm"
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => saveMut.mutate()}
              disabled={saveMut.isPending}
              className="rounded bg-[#0B409C] px-3 py-1.5 text-sm text-white hover:bg-[#0B409C]/90 disabled:opacity-50"
            >
              Simpan
            </button>
            <button
              onClick={() => {
                setEditing(null);
                setIsNew(false);
                setImageFile(null);
              }}
              className="rounded border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              Batal
            </button>
          </div>
        </div>
      )}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {rows.map((row: Row) => (
          <div key={row.id} className="rounded-lg border bg-white p-3 shadow-sm">
            {row.image_url && (
              <img src={row.image_url} alt="" className="mb-2 h-24 w-full rounded object-cover" />
            )}
            <p className="text-sm font-medium text-[#10316B]">{row.title}</p>
            <p className="text-xs text-gray-500">{row.caption}</p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => {
                  setEditing(row);
                  setIsNew(false);
                }}
                className="text-xs text-[#0B409C] hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (confirm("Hapus?")) deleteMut.mutate(row.id);
                }}
                className="text-xs text-red-500 hover:underline"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
