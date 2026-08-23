import { createServerFn } from "@tanstack/react-start";

import { uploadArtifact } from "./service-client";
import type { ArtifactKind } from "./types";

const MAX_UPLOAD_BYTES = 200 * 1024 * 1024; // 200MB, mirrors processing-service/app/artifacts.py

export const uploadArtifactFn = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data }) => {
    const file = data.get("file");
    const kind = data.get("kind");
    if (!(file instanceof File)) {
      throw new Error("Field 'file' wajib diisi");
    }
    if (kind !== "raster" && kind !== "vector" && kind !== "table") {
      throw new Error("Field 'kind' harus raster, vector, atau table");
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new Error("Ukuran file melebihi batas maksimum 200MB");
    }
    return uploadArtifact(file, kind as ArtifactKind);
  });
