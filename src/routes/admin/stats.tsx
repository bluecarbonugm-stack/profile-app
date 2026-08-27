import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { statsCrud } from "@/features/profile/api/admin-content";
import {
  AdminEditCard,
  AdminListRow,
  AdminPageHeader,
  NumberField,
  TextField,
} from "@/features/profile/components/admin/admin-field";

export const Route = createFileRoute("/admin/stats")({
  component: AdminStats,
});

interface Row {
  id: string;
  value: string;
  label: string;
  sort_order: number;
}
const EMPTY = { value: "", label: "", sort_order: 0 };

function AdminStats() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Row> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const { data: rows = [] } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => statsCrud.list({ data: undefined }),
  });
  const saveMut = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      if (isNew) await statsCrud.create({ data: editing });
      else await statsCrud.update({ data: { id: editing.id!, updates: editing } });
    },
    onSuccess: () => {
      setEditing(null);
      setIsNew(false);
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => statsCrud.remove({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "stats"] }),
  });

  return (
    <div>
      <AdminPageHeader
        title="Statistik"
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
            label="Nilai"
            value={editing.value ?? ""}
            onChange={(v) => setEditing({ ...editing, value: v })}
          />
          <TextField
            label="Label"
            value={editing.label ?? ""}
            onChange={(v) => setEditing({ ...editing, label: v })}
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
            <p className="text-sm">
              <span className="tabular font-medium">{row.value}</span>{" "}
              <span className="text-muted-foreground">{row.label}</span>
            </p>
          </AdminListRow>
        ))}
      </div>
    </div>
  );
}
