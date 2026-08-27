import type { ReactNode } from "react";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";

/**
 * Shared field + layout primitives for the /admin CRUD forms. Centralized so
 * every section editor (site, team, publications, ...) renders the same
 * label/input/card treatment sourced from the app's design tokens, instead
 * of each route hand-rolling its own `border-gray-300` / hardcoded hex
 * markup and repeating the add/edit/delete row chrome nine times over.
 */

/** Page title + primary "add new" action, shared by every list-CRUD route. */
export function AdminPageHeader({
  title,
  addLabel = "Tambah",
  onAdd,
}: {
  title: string;
  addLabel?: string;
  onAdd: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-display">{title}</h1>
      <Button size="sm" onClick={onAdd}>
        + {addLabel}
      </Button>
    </div>
  );
}

/** The inline create/edit form card, with a consistent Simpan/Batal footer. */
export function AdminEditCard({
  children,
  onSave,
  onCancel,
  isPending,
  isSuccess,
  isError,
}: {
  children: ReactNode;
  onSave: () => void;
  onCancel: () => void;
  isPending: boolean;
  isSuccess?: boolean;
  isError?: boolean;
}) {
  return (
    <Card className="mt-4 gap-3 p-5">
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
      <div className="mt-1 flex items-center gap-3">
        <Button size="sm" onClick={onSave} disabled={isPending}>
          {isPending ? "Menyimpan…" : "Simpan"}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <SaveStatus isPending={isPending} isSuccess={!!isSuccess} isError={!!isError} />
      </div>
    </Card>
  );
}

/** One row in the read-only list beneath the edit card. */
export function AdminListRow({
  children,
  onEdit,
  onDelete,
}: {
  children: ReactNode;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
      <div className="min-w-0 flex-1">{children}</div>
      <div className="flex shrink-0 gap-4">
        <button type="button" onClick={onEdit} className="text-xs text-primary hover:underline">
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="text-xs text-destructive hover:underline"
        >
          Hapus
        </button>
      </div>
    </div>
  );
}

export function TextField({
  label,
  hint,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block space-y-1.5">
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </label>
  );
}

export function TextAreaField({
  label,
  hint,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="block space-y-1.5">
      <Label>{label}</Label>
      <Textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </label>
  );
}

export function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block space-y-1.5">
      <Label>{label}</Label>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-24 tabular"
      />
    </label>
  );
}

/** Inline save-state indicator: idle button label swaps, success/error text after. */
export function SaveStatus({
  isPending,
  isSuccess,
  isError,
}: {
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
}) {
  if (isPending) return null;
  if (isSuccess) return <span className="text-sm text-emerald-600">Tersimpan.</span>;
  if (isError) return <span className="text-sm text-destructive">Gagal menyimpan.</span>;
  return null;
}
