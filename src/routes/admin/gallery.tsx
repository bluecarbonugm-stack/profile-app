import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { galleryCrud, uploadImage } from "@/features/profile/api/admin-content";
import { Card } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import {
  AdminEditCard,
  AdminPageHeader,
  NumberField,
  TextField,
} from "@/features/profile/components/admin/admin-field";

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
      <AdminPageHeader
        title="Galeri"
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
            setImageFile(null);
          }}
          isPending={saveMut.isPending}
          isSuccess={saveMut.isSuccess}
          isError={saveMut.isError}
        >
          <TextField
            label="Judul"
            value={editing.title ?? ""}
            onChange={(v) => setEditing({ ...editing, title: v })}
          />
          <TextField
            label="Caption"
            value={editing.caption ?? ""}
            onChange={(v) => setEditing({ ...editing, caption: v })}
          />
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Gambar</Label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="block text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-secondary-foreground"
            />
            {editing.image_url && !imageFile && (
              <img src={editing.image_url} alt="" className="h-16 w-16 rounded object-cover" />
            )}
          </div>
          <NumberField
            label="Urutan"
            value={editing.sort_order ?? 0}
            onChange={(v) => setEditing({ ...editing, sort_order: v })}
          />
        </AdminEditCard>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        {rows.map((row: Row) => (
          <Card key={row.id} className="gap-2 p-3">
            {row.image_url && (
              <img src={row.image_url} alt="" className="h-24 w-full rounded object-cover" />
            )}
            <p className="text-sm font-medium">{row.title}</p>
            <p className="text-xs text-muted-foreground">{row.caption}</p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setEditing(row);
                  setIsNew(false);
                }}
                className="text-xs text-primary hover:underline"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Hapus?")) deleteMut.mutate(row.id);
                }}
                className="text-xs text-destructive hover:underline"
              >
                Hapus
              </button>
            </div>
          </Card>
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
