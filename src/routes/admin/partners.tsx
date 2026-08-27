import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { partnersCrud } from "@/features/profile/api/admin-content";
import {
  AdminEditCard,
  AdminListRow,
  AdminPageHeader,
  NumberField,
  TextField,
} from "@/features/profile/components/admin/admin-field";

export const Route = createFileRoute("/admin/partners")({
  component: AdminPartners,
});

interface Row {
  id: string;
  name: string;
  sort_order: number;
}
const EMPTY = { name: "", sort_order: 0 };

function AdminPartners() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Row> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const { data: rows = [] } = useQuery({
    queryKey: ["admin", "partners"],
    queryFn: () => partnersCrud.list({ data: undefined }),
  });
  const saveMut = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      if (isNew) await partnersCrud.create({ data: editing });
      else await partnersCrud.update({ data: { id: editing.id!, updates: editing } });
    },
    onSuccess: () => {
      setEditing(null);
      setIsNew(false);
      qc.invalidateQueries({ queryKey: ["admin", "partners"] });
    },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => partnersCrud.remove({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "partners"] }),
  });

  return (
    <div>
      <AdminPageHeader
        title="Mitra"
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
            label="Nama Mitra"
            value={editing.name ?? ""}
            onChange={(v) => setEditing({ ...editing, name: v })}
          />
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
            <p className="text-sm font-medium">{row.name}</p>
          </AdminListRow>
        ))}
      </div>
    </div>
  );
}
