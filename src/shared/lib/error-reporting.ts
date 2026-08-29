// Client-side error reporting for the React error boundary in __root.tsx.
// Standalone - no dependency on any external editor/preview runtime. Swap the
// console.error call for a real sink (Sentry, etc.) if/when one is wired up.

export interface ErrorReportContext {
  boundary?: string;
  [key: string]: unknown;
}

export function reportError(error: unknown, context: ErrorReportContext = {}): void {
  if (typeof window === "undefined") return;

  // Loaders and server fns commonly throw a raw Response; String(it) is the
  // opaque "[object Response]", so pull out the status and URL instead.
  const message =
    error instanceof Response
      ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`
      : error instanceof Error
        ? error.message
        : String(error);

  console.error("[error-boundary]", message, {
    route: window.location.pathname,
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  });
}
