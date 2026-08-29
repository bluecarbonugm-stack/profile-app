# Session State & Next Phase Notes

> Written 2026-08-25. Snapshot of where the repo stands and what remains.

## Repo State

- Repo: `C:\Users\lenovo\Documents\GitHub\bluecarbonwebprofile`
- `main` @ `5ae94c0`, pushed to origin. `enhance/dev-vendor-restructure` force-aligned to same commit, pushed.
- Lovable sync commit `9dd385b` ("revert preview script") is harmless - identical to our config.
- `stash@{0}` still exists; everything valuable already recovered from it. Safe to drop.
- Ledger `.superpowers/sdd/2026-08-22-processing-engine-phase2/progress.md` rewritten to reflect real gate status - **modified, not yet committed**.

## Verification Gates (all green at 5ae94c0)

| Gate      | Command                                                              | Result                  |
| --------- | -------------------------------------------------------------------- | ----------------------- |
| backend   | `processing-service/.venv/Scripts/python.exe -m pytest processing-service/tests -q` | 44 passed |
| frontend  | `npx vitest run`                                                      | 3 files, 8 tests passed |
| typecheck | `npm run typecheck`                                                   | 0 errors                |
| lint      | `npm run lint`                                                        | 0 errors, 2 warnings    |
| build     | `npm run build`                                                       | OK, emits `dist/server/server.js` |
| preview   | `npm run preview`                                                     | HTTP 200 SSR            |

**Important:** system Python has a broken global fiona/geopandas pair. Always use the venv interpreter for backend tests.

## Remaining / Unfinished

1. **Final whole-branch review** (range `fa002e1..5ae94c0`) - dispatched once, cancelled by user. Still open.
2. **Commit the corrected ledger** (`progress.md`).
3. **Drop stale `stash@{0}`**.
4. **Supabase integration** - deferred. `.env` holds `VITE_SUPABASE_URL=https://bmeffxdjzdtiizhvhugj.supabase.co` plus anon key; `@supabase/supabase-js` is NOT installed; the helper `src/shared/lib/supabase.ts` was removed as dead code.
5. **Leaflet ROI mini-map** - deliberately deferred in Phase 2 (manual lat/lon editor shipped instead).
6. **Playwright E2E** - `playwright.config.ts` exists untracked, no specs.

## Next Phase Focus (user request, 2026-08-25)

- Supabase integration for profile content and media.
- Continued enhanced-UI work.
- A **separate local admin web app** acting as a gate for media upload and profile-info updates. User is undecided whether this separate app is actually needed - needs brainstorming before any build.

## Local-only untracked files (intentionally not committed)

`.claude/`, `CLAUDE.md`, `.env`, `.env.example`, `.gitattributes`, `playwright.config.ts`, `scripts/`, `zed-dev-uiux-brief.md`, `graphify-out/`, `supabasekey.txt`
