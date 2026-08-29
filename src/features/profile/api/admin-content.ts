import { createServerFn } from "@tanstack/react-start";
import { getSupabaseAdmin } from "../../../shared/lib/supabase";
import { invalidateProfileContentCache } from "./content-source";

// ─── Generic list CRUD ──────────────────────────────────────────────────────
// Auth is handled by the /admin layout route middleware. These functions use
// the service_role key (bypasses RLS) and trust that only authenticated admin
// requests reach them.

function createListCrud(tableName: string) {
  const list = createServerFn({ method: "GET" }).handler(async () => {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from(tableName).select("*").order("sort_order");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

  const create = createServerFn({ method: "POST" })
    .validator((data: Record<string, unknown>) => data)
    .handler(async ({ data }) => {
      const supabase = getSupabaseAdmin();
      const { error } = await supabase.from(tableName).insert(data);
      if (error) throw new Error(error.message);
      invalidateProfileContentCache();
      return { ok: true };
    });

  const update = createServerFn({ method: "POST" })
    .validator((data: { id: string; updates: Record<string, unknown> }) => data)
    .handler(async ({ data }) => {
      const supabase = getSupabaseAdmin();
      const { error } = await supabase.from(tableName).update(data.updates).eq("id", data.id);
      if (error) throw new Error(error.message);
      invalidateProfileContentCache();
      return { ok: true };
    });

  const remove = createServerFn({ method: "POST" })
    .validator((data: { id: string }) => data)
    .handler(async ({ data }) => {
      const supabase = getSupabaseAdmin();
      const { error } = await supabase.from(tableName).delete().eq("id", data.id);
      if (error) throw new Error(error.message);
      invalidateProfileContentCache();
      return { ok: true };
    });

  return { list, create, update, remove };
}

export const statsCrud = createListCrud("stats");
export const focusCrud = createListCrud("focus");
export const teamCrud = createListCrud("team");
export const publicationsCrud = createListCrud("publications");
export const galleryCrud = createListCrud("gallery");
export const partnersCrud = createListCrud("partners");

// ─── Site (single row) ─────────────────────────────────────────────────────

export const getSite = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("site").select("*").limit(1).single();
  if (error) throw new Error(error.message);
  return data;
});

export const updateSite = createServerFn({ method: "POST" })
  .validator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    const { data: current } = await supabase.from("site").select("id").limit(1).single();
    if (!current) throw new Error("No site row found");
    const { error } = await supabase.from("site").update(data).eq("id", current.id);
    if (error) throw new Error(error.message);
    invalidateProfileContentCache();
    return { ok: true };
  });

// ─── Image Upload ───────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const uploadImage = createServerFn({ method: "POST" })
  .validator(
    (data: { section: string; fileBase64: string; fileName: string; fileType: string }) => data,
  )
  .handler(async ({ data }) => {
    if (!ALLOWED_TYPES.includes(data.fileType)) {
      throw new Error(`Invalid file type: ${data.fileType}. Allowed: ${ALLOWED_TYPES.join(", ")}`);
    }

    const buffer = Buffer.from(data.fileBase64, "base64");
    if (buffer.length > MAX_FILE_SIZE) {
      throw new Error(`File too large: ${buffer.length} bytes. Max: ${MAX_FILE_SIZE}`);
    }

    const ext = data.fileName.split(".").pop() ?? "jpg";
    const path = `${data.section}/${crypto.randomUUID()}.${ext}`;

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.storage.from("site-images").upload(path, buffer, {
      contentType: data.fileType,
    });
    if (error) throw new Error(error.message);

    const { data: urlData } = supabase.storage.from("site-images").getPublicUrl(path);
    return { url: urlData.publicUrl };
  });

export const deleteImage = createServerFn({ method: "POST" })
  .validator((data: { path: string }) => data)
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.storage.from("site-images").remove([data.path]);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
