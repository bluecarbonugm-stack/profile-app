import { createServerFn } from "@tanstack/react-start";

import { loadProfileContent } from "./content-source";
import type { ProfilePayload } from "../types";

/**
 * Route-facing entry point for profile content.
 *
 * Runs on the server during SSR and as an RPC on client navigations, so the
 * spreadsheet endpoint and token stay out of the browser bundle while the
 * rendered HTML still contains the real content for crawlers.
 */
export const getProfileContent = createServerFn({ method: "GET" }).handler(
  async (): Promise<ProfilePayload> => loadProfileContent(),
);
