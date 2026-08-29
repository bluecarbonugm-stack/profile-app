# Extracting Processing into its own repo

**Status:** not extracted yet. This documents the boundary and the path to
do it later, in phases, without a rushed cut today. Verified 2026-08-29 -
`features/processing/**` has zero imports from `features/profile/**` or
vice versa (AGENTS.md rule 1 was already being enforced, so this required
no code changes - just confirming it holds).

## Why now, why not now

The Workbench (`/processing`) and the Web Profile (`/`) are two different
products sharing one repo, one deploy, and one design-token stylesheet.
Splitting them lets Processing be rebuilt/re-architected in its own repo,
on its own timeline, in whatever stack makes sense for it next - without
every experimental commit touching the profile site's history or CI.

Not doing it today because: the boundary needs to stay real (not just
declared) through however many phases the standalone rebuild takes, and
splitting prematurely just means solving the same "what's genuinely shared
vs. duplicated" questions twice instead of once, later, with a working
implementation to observe instead of guessing at it now.

## What would move

```
src/features/processing/**        # all components, api, data, tests
src/routes/processing.tsx         # the route shell (mobile notice, lazy Workbench)
processing-service/**             # the Python/FastAPI backend, entirely separate already
```

`processing-service` is already a standalone FastAPI app (`uvicorn
app.main:app`) with no dependency on anything in `src/` beyond an HTTP
contract - it doesn't need any changes to move, just a new home.

## What stays behind (and needs a decision at extraction time)

These are things the new repo will need its own copy of, not things it can
keep importing from this one:

| What | Where it lives now | Options for the new repo |
|---|---|---|
| Design tokens (`--ocean-deep`, `--port-*`, `.dark` theme, fonts, radius) | `src/styles.css` `:root`/`.dark`/`@theme inline` | Copy the token block. The two products can diverge from here — Processing doesn't have to track the profile's palette forever. |
| `.workbench .react-flow__*` overrides | `src/styles.css` (bottom section) | Copy verbatim - React Flow theming, not profile-specific. |
| Shared UI primitives it actually uses | `src/shared/components/ui/{button,input,checkbox,dropdown-menu,select}.tsx` | Small, dependency-light shadcn components. Cheapest path is re-running the shadcn CLI in the new repo rather than copying these particular files. |
| `cn()` helper | `src/shared/lib/utils.ts` | One-line `clsx`+`tailwind-merge` wrapper - trivial to duplicate. |
| `@xyflow/react`, `recharts` | `package.json` | Move as-is; confirmed unused anywhere outside `features/processing/**`. |

Nothing else in `shared/` is used by processing (verified by grep - the
only cross-imports are the five UI primitives and `cn()` above).

## The relink step

Exactly one place in the whole codebase links to `/processing`:
[`HeroSection.tsx`](../src/features/profile/components/HeroSection.tsx)'s
primary CTA, `<Link to="/processing">` (a type-checked TanStack Router
route reference). At extraction time:

1. Delete `src/routes/processing.tsx` and `src/features/processing/`.
   TypeScript will immediately flag the now-dangling `<Link to="/processing">`
   in HeroSection - that's the safety net, not a thing to route around.
2. Replace it with a plain external link: `<a href={PROCESSING_APP_URL}>`,
   `target="_blank"` optional depending on whether it should feel like
   leaving the site or a companion app.
3. Point `PROCESSING_APP_URL` at wherever the new repo deploys.

No config abstraction was built for this ahead of time - there is exactly
one call site, and building a URL-config layer for one link would be
speculative complexity AGENTS.md rule 5 already argues against. Change the
one line when the new repo has somewhere to point at.

## Interface contract worth keeping stable across the rebuild

Whatever the Workbench becomes in its new repo, the frontend/backend
contract it needs to keep talking (or deliberately replace) is:

- `GET /` - health check, `{"status": "ok"}`.
- `POST /artifacts` (multipart: `file`, `kind`) - upload, returns
  `{id, kind, filename}`.
- `POST /nodes/{node_type}/execute` - run one node given upstream results.

See `processing-service/app/main.py` and
`src/features/processing/api/service-client.ts` (`SERVICE_URL`, currently
`process.env.PROCESSING_SERVICE_URL ?? "http://127.0.0.1:8787"`) for the
exact shapes.
