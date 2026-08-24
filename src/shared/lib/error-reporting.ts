// Client-side error reporting.
//
// Production React does not rethrow errors caught by an error boundary to
// window.onerror, so anything the boundaries catch would otherwise be invisible.
// This module funnels those into one place and lets the app plug in a real
// telemetry sink (Sentry, GlitchTip, a custom endpoint) without any component
// needing to know which one is in use.

export type ErrorContext = Record<string, unknown>;

export interface ErrorReport {
  message: string;
  stack?: string;
  route?: string;
  context: ErrorContext;
}

export type ErrorReporter = (report: ErrorReport, error: unknown) => void;

let reporter: ErrorReporter | undefined;

/**
 * Register the telemetry sink. Call once during client bootstrap, e.g.
 *
 *   setErrorReporter((report) => Sentry.captureException(report));
 *
 * Passing `undefined` restores the console-only default.
 */
export function setErrorReporter(next: ErrorReporter | undefined): void {
  reporter = next;
}

/**
 * Loaders and server functions commonly throw a raw `Response`, whose
 * `String(...)` is the useless "[object Response]" — pull the status and URL
 * out instead so the report still says something.
 */
export function describeError(error: unknown): string {
  if (error instanceof Response) {
    return `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`;
  }
  if (error instanceof Error) return error.message;
  return String(error);
}

export function reportError(error: unknown, context: ErrorContext = {}): void {
  if (typeof window === "undefined") return;

  const report: ErrorReport = {
    message: describeError(error),
    stack: error instanceof Error ? error.stack : undefined,
    route: window.location.pathname,
    context,
  };

  if (reporter) {
    try {
      reporter(report, error);
      return;
    } catch (reporterError) {
      // A broken sink must never mask the error it was asked to report.
      console.error("Error reporter threw while handling an error", reporterError);
    }
  }

  console.error(report.message, report);
}
