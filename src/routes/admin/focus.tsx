import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { focusCrud } from "@/features/profile/api/admin-content";
import {
  AdminEditCard,
  AdminListRow,
  AdminPageHeader,
  NumberField,
  TextAreaField,
  TextField,
} from "@/features/profile/components/admin/admin-field";

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
      <AdminPageHeader
        title="Focus Area"
        onAdd={() => {
          setEditing({ ...EMPTY, sort_order: rows.length + 1 });
          setIsNew(true);
        }}
      />

      {editing && (
        <AdminEditCard
          onSave={() => saveMut.mutate()}
          onCancel={() => {
            setEditing(null);
            setIsNew(false);
          }}
          isPending={saveMut.isPending}
          isSuccess={saveMut.isSuccess}
          isError={saveMut.isError}
        >
          <TextField
            label="Icon"
            hint="Nama ikon lucide: satellite, fish, sprout, chart, waves, layers."
            value={editing.icon ?? ""}
            onChange={(v) => setEditing({ ...editing, icon: v })}
          />
          <TextField
            label="Judul"
            value={editing.title ?? ""}
            onChange={(v) => setEditing({ ...editing, title: v })}
          />
          <div className="sm:col-span-2">
            <TextAreaField
              label="Deskripsi"
              rows={3}
              value={editing.body ?? ""}
              onChange={(v) => setEditing({ ...editing, body: v })}
            />
          </div>
          <NumberField
            label="Urutan"
            value={editing.sort_order ?? 0}
            onChange={(v) => setEditing({ ...editing, sort_order: v })}
          />
        </AdminEditCard>
      )}

      <div className="mt-4 space-y-2">
        {rows.map((row: Row) => (
          <AdminListRow
            key={row.id}
            onEdit={() => {
              setEditing(row);
              setIsNew(false);
            }}
            onDelete={() => {
              if (confirm("Hapus?")) deleteMut.mutate(row.id);
            }}
          >
            <p className="text-sm font-medium">{row.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-1">{row.body}</p>
          </AdminListRow>
        ))}
      </div>
    </div>
  );
}
