import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { focusCrud } from "@/features/profile/api/admin-content";

export const Route = createFileRoute("/admin/focus")({
  component: AdminFocus,
});

interface Row {
  id: string;
  icon: string;
  title: string;
  body: string;
  sort_order: number;
}
const EMPTY = { icon: "", title: "", body: "", sort_order: 0 };

function AdminFocus() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Row> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const { data: rows = [] } = useQuery({
    queryKey: ["admin", "focus"],
    queryFn: () => focusCrud.list({ data: undefined }),
  });
  const saveMut = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      if (isNew) await focusCrud.create({ data: editing });
      else await focusCrud.update({ data: { id: editing.id!, updates: editing } });
    },
    onSuccess: () => {
      setEditing(null);
      setIsNew(false);
      qc.invalidateQueries({ queryKey: ["admin", "focus"] });
    },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => focusCrud.remove({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "focus"] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#10316B]">Focus Area</h1>
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
              placeholder="Icon (lucide name)"
              value={editing.icon ?? ""}
              onChange={(e) => setEditing({ ...editing, icon: e.target.value })}
              className="rounded border px-3 py-2 text-sm"
            />
            <input
              placeholder="Judul"
              value={editing.title ?? ""}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              className="rounded border px-3 py-2 text-sm"
            />
            <textarea
              placeholder="Deskripsi"
              value={editing.body ?? ""}
              onChange={(e) => setEditing({ ...editing, body: e.target.value })}
              rows={3}
              className="col-span-2 rounded border px-3 py-2 text-sm"
            />
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
              }}
              className="rounded border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              Batal
            </button>
          </div>
        </div>
      )}
      <div className="mt-4 space-y-2">
        {rows.map((row: Row) => (
          <div
            key={row.id}
            className="flex items-center justify-between rounded-lg border bg-white px-4 py-3 shadow-sm"
          >
            <div>
              <p className="text-sm font-medium text-[#10316B]">{row.title}</p>
              <p className="text-xs text-gray-500 line-clamp-1">{row.body}</p>
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
