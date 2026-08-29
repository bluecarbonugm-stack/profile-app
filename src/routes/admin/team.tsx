import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { teamCrud, uploadImage } from "@/features/profile/api/admin-content";
import { Label } from "@/shared/components/ui/label";
import {
  AdminEditCard,
  AdminListRow,
  AdminPageHeader,
  NumberField,
  TextField,
} from "@/features/profile/components/admin/admin-field";

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
      <AdminPageHeader
        title="Tim"
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
            setPhotoFile(null);
          }}
          isPending={saveMut.isPending}
          isSuccess={saveMut.isSuccess}
          isError={saveMut.isError}
        >
          <TextField
            label="Nama"
            value={editing.name ?? ""}
            onChange={(v) => setEditing({ ...editing, name: v })}
          />
          <TextField
            label="Role"
            value={editing.role ?? ""}
            onChange={(v) => setEditing({ ...editing, role: v })}
          />
          <TextField
            label="Bidang"
            value={editing.field ?? ""}
            onChange={(v) => setEditing({ ...editing, field: v })}
          />
          <NumberField
            label="Urutan"
            value={editing.sort_order ?? 0}
            onChange={(v) => setEditing({ ...editing, sort_order: v })}
          />
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Foto</Label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              className="block text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-secondary-foreground"
            />
            {editing.photo_url && !photoFile && (
              <img src={editing.photo_url} alt="" className="h-12 w-12 rounded object-cover" />
            )}
          </div>
        </AdminEditCard>
      )}

      <div className="mt-4 space-y-2">
        {rows.map((row: TeamRow) => (
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
            <div className="flex items-center gap-3">
              {row.photo_url && (
                <img src={row.photo_url} alt="" className="h-8 w-8 rounded object-cover" />
              )}
              <div>
                <p className="text-sm font-medium">{row.name}</p>
                <p className="text-xs text-muted-foreground">
                  {row.role} — {row.field}
                </p>
              </div>
            </div>
          </AdminListRow>
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
