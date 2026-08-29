import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { publicationsCrud } from "@/features/profile/api/admin-content";
import {
  AdminEditCard,
  AdminListRow,
  AdminPageHeader,
  NumberField,
  TextField,
} from "@/features/profile/components/admin/admin-field";

export const Route = createFileRoute("/admin/publications")({
  component: AdminPublications,
});

interface Row {
  id: string;
  year: string;
  type: string;
  title: string;
  authors: string;
  venue: string;
  sort_order: number;
}

const EMPTY = { year: "", type: "", title: "", authors: "", venue: "", sort_order: 0 };

function AdminPublications() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Row> | null>(null);
  const [isNew, setIsNew] = useState(false);

  const { data: rows = [] } = useQuery({
    queryKey: ["admin", "publications"],
    queryFn: () => publicationsCrud.list({ data: undefined }),
  });

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      if (isNew) await publicationsCrud.create({ data: editing });
      else await publicationsCrud.update({ data: { id: editing.id!, updates: editing } });
    },
    onSuccess: () => {
      setEditing(null);
      setIsNew(false);
      qc.invalidateQueries({ queryKey: ["admin", "publications"] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => publicationsCrud.remove({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "publications"] }),
  });

  const set = (key: keyof Row) => (value: string) => setEditing({ ...editing, [key]: value });

  return (
    <div>
      <AdminPageHeader
        title="Publikasi"
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
          <TextField label="Tahun" value={editing.year ?? ""} onChange={set("year")} />
          <TextField label="Tipe" value={editing.type ?? ""} onChange={set("type")} />
          <div className="sm:col-span-2">
            <TextField label="Judul" value={editing.title ?? ""} onChange={set("title")} />
          </div>
          <TextField label="Penulis" value={editing.authors ?? ""} onChange={set("authors")} />
          <TextField label="Venue" value={editing.venue ?? ""} onChange={set("venue")} />
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
            <p className="text-xs text-muted-foreground">
              {row.authors} — {row.venue} ({row.year})
            </p>
          </AdminListRow>
        ))}
      </div>
    </div>
  );
}
