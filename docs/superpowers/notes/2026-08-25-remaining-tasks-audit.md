# Remaining Tasks Audit + Next Phase Brainstorm Input

> Written 2026-08-25. Companion to `2026-08-25-state-and-next-phase.md`.

## A. Phase 2 plan audit (`docs/superpowers/plans/2026-08-24-processing-engine-phase2.md`)

Plan contains 9 tasks (Task 1 JSON param contract -> Task 9 verification gate + ledger).
All 9 are **implemented and committed** (see progress ledger), but **every `- [ ]` checkbox
in the plan file is still unchecked** - the plan document was never marked off during the
recovery scramble. The plan file is documentation debt only, not code debt.

Checkbox counts: 9 tasks x ~5-7 steps each, all unmarked.

### Phase 2 closure work still open

1. Mark plan checkboxes as done (or add a closure header noting commits per task).
2. Commit the corrected ledger `progress.md` (currently modified, uncommitted).
3. Final whole-branch review, range `fa002e1..5ae94c0` (dispatched once, user cancelled).
4. Drop stale `stash@{0}` (contents fully recovered already).

## B. Carried-over deferrals (confirmed, not accidental)

| Item | State | Notes |
| ---- | ----- | ----- |
| Leaflet ROI mini-map | deferred by design | manual lat/lon `RoiPointEditor` shipped instead |
| Playwright E2E | deferred | `playwright.config.ts` untracked, zero specs |
| Supabase client | deferred | `.env` has URL + anon key; `@supabase/supabase-js` NOT installed; helper deleted as dead code |
| Profile content source | fallback only | `src/features/profile/api/content-source.ts` + `data/fallback-content.ts` serve static content today |

## C. Next phase - three streams the user named

1. **Supabase integration** - profile content + media storage.
2. **Enhanced UI continuation** - keep extending the PRISM/profile visual system.
3. **Admin app for media upload + profile info updates**, run locally, "separate" - user is
   explicitly unsure whether a separate app is warranted.

### Open question to resolve by brainstorming (do NOT build before this is settled)

Separate admin app vs. in-app admin route. Decision inputs to gather:
- Who edits content? (single researcher vs. lab members)
- Is auth needed beyond Supabase RLS + a single admin account?
- Does the admin need to run offline/local-only, or is a protected `/admin` route on the
  deployed site acceptable?
- Media volume/type (images, GeoTIFF results, publication PDFs?) and size limits.
- Should processing-run artifacts (PRISM outputs) also land in Supabase storage, or stay
  in the local artifact store?

Cheapest path that likely satisfies the need: a protected `/admin` route inside the
existing app using Supabase Auth + RLS + Storage, no second codebase. A separate local app
is only justified if the editor must work fully offline or must never be exposed publicly.

## D. Suggested next-phase task order (draft, pending brainstorm)

1. Brainstorm + decide admin surface (separate app vs `/admin` route).
2. Write Phase 3 spec: Supabase schema (profile sections, publications, media),
   RLS policies, storage buckets, auth model.
3. Install `@supabase/supabase-js`, restore `src/shared/lib/supabase.ts` typed client.
4. Content-source swap: `content-source.ts` reads Supabase with static fallback retained.
5. Media pipeline: upload UI -> Supabase Storage -> public URL rendering in profile UI.
6. Admin CRUD for profile sections/publications.
7. Gates + E2E smoke (revive Playwright config with 2-3 specs).
