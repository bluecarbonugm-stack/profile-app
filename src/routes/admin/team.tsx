import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { teamCrud, uploadImage, deleteImage } from "@/features/profile/api/admin-content";

export const Route = createFileRoute("/admin/team")({
  component: AdminTeam,
});

interface TeamRow {
  id: string;
  name: string;
  role: string;
  field: string;
  sort_order: number;
  photo_url: string | null;
}

const EMPTY = { name: "", role: "", field: "", sort_order: 0, photo_url: null };

function AdminTeam() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<TeamRow> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const { data: rows = [] } = useQuery({
    queryKey: ["admin", "team"],
    queryFn: () => teamCrud.list({ data: undefined }),
  });

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      let photoUrl = editing.photo_url;
      if (photoFile) {
        const b64 = await fileToBase64(photoFile);
        const res = await uploadImage({
          data: {
            section: "team",
            fileBase64: b64,
            fileName: photoFile.name,
            fileType: photoFile.type,
          },
        });
        photoUrl = res.url;
      }
      const payload = { ...editing, photo_url: photoUrl };
      if (isNew) {
        await teamCrud.create({ data: payload });
      } else {
        await teamCrud.update({ data: { id: editing.id!, updates: payload } });
      }
    },
    onSuccess: () => {
      setEditing(null);
      setIsNew(false);
      setPhotoFile(null);
      qc.invalidateQueries({ queryKey: ["admin", "team"] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => teamCrud.remove({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "team"] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#10316B]">Tim</h1>
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
              placeholder="Nama"
              value={editing.name ?? ""}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              className="rounded border px-3 py-2 text-sm"
            />
            <input
              placeholder="Role"
              value={editing.role ?? ""}
              onChange={(e) => setEditing({ ...editing, role: e.target.value })}
              className="rounded border px-3 py-2 text-sm"
            />
            <input
              placeholder="Bidang"
              value={editing.field ?? ""}
              onChange={(e) => setEditing({ ...editing, field: e.target.value })}
              className="rounded border px-3 py-2 text-sm"
            />
            <input
              type="number"
              placeholder="Urutan"
              value={editing.sort_order ?? 0}
              onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
              className="rounded border px-3 py-2 text-sm"
            />
            <div className="col-span-2">
              <label className="block text-xs text-gray-500">Foto</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                className="mt-1 text-sm"
              />
              {editing.photo_url && !photoFile && (
                <img
                  src={editing.photo_url}
                  alt=""
                  className="mt-2 h-12 w-12 rounded object-cover"
                />
              )}
            </div>
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
                setPhotoFile(null);
              }}
              className="rounded border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-2">
        {rows.map((row: TeamRow) => (
          <div
            key={row.id}
            className="flex items-center justify-between rounded-lg border bg-white px-4 py-3 shadow-sm"
          >
            <div className="flex items-center gap-3">
              {row.photo_url && (
                <img src={row.photo_url} alt="" className="h-8 w-8 rounded object-cover" />
              )}
              <div>
                <p className="text-sm font-medium text-[#10316B]">{row.name}</p>
                <p className="text-xs text-gray-500">
                  {row.role} — {row.field}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
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
    reader.onload = () => {
      const b64 = (reader.result as string).split(",")[1];
      resolve(b64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
