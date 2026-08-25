# Phase 2 Closure Checklist (in progress 2026-08-25)

Working repo: `C:\Users\lenovo\Documents\GitHub\bluecarbonwebprofile`, branch `main` @ `5ae94c0` (pushed).
Feature branch `enhance/dev-vendor-restructure` force-aligned to same commit.
User approved order: close Phase 2 first, then brainstorm Phase 3 (Supabase + admin).

## Steps

1. [x] Plan checkboxes marked done in `docs/superpowers/plans/2026-08-24-processing-engine-phase2.md`
       (47 of 48 `- [ ]` -> `- [x]`; the 1 remaining match is literal syntax text inside the
       "For agentic workers" note on line 3 and must stay unchanged).
2. [x] Closure STATUS header inserted at top of the plan file (verify with a grep for
       "STATUS: CLOSED" before committing; the shell here truncates multi-line output so
       only the last line of any command is visible - use single-value output per command).
3. [ ] Commit: corrected ledger `.superpowers/sdd/2026-08-22-processing-engine-phase2/progress.md`
       + plan checkbox/header update + `docs/superpowers/notes/` (3 files).
       Do NOT commit: `.claude/`, `CLAUDE.md`, `.env.example`, `.gitattributes`,
       `playwright.config.ts`, `scripts/`, `zed-dev-uiux-brief.md`, `test-results/`.
4. [ ] Final whole-branch review, range `fa002e1..5ae94c0`, read-only general subagent.
5. [ ] Address review findings (Critical/Important only).
6. [ ] Drop stale stash: PowerShell needs `$s = "stash@{0}"; git stash drop $s`
       (stash is `WIP on enhance/dev-vendor-restructure: f250ab5`; contents fully recovered).
7. [ ] Push closure commit to origin main (+ align feature branch).

## Shell gotcha (important)

This PowerShell tool has been returning ONLY the final line of multi-line output for the
last several calls. Workarounds: one fact per command, write results to a file and read it
back with the Read tool, or pipe through `Out-String` and read a file instead.

## Commit map for closure header

T1 `fc26af5`; T2-T4, T6-T8 `ee9e168`; T5 `f5607ad` + review fixes `ee9e168`; T9 ledger commit.
Related: `e88ca69` import repair, `493af12` UI identity, `e36b4d3` drop nitro,
`88a1835` chore/docs, `9dd385b` Lovable sync (harmless), `5ae94c0` workbench parity.

## Gate commands (all green at 5ae94c0)

- backend: `processing-service/.venv/Scripts/python.exe -m pytest processing-service/tests -q` -> 44 passed
- frontend: `npx vitest run` -> 3 files / 8 tests
- `npm run typecheck` -> 0 errors; `npm run lint` -> 0 errors/2 warnings
- `npm run build` -> OK, emits `dist/server/server.js`; `npm run preview` -> HTTP 200

## After closure: Phase 3 brainstorm

Use superpowers:brainstorming. Inputs in `docs/superpowers/notes/2026-08-25-remaining-tasks-audit.md`
sections C/D. Key question: separate local admin app vs protected `/admin` route
(recommendation: `/admin` route with Supabase Auth + RLS + Storage, no second codebase).
Need from user: who edits content, media types/sizes, whether PRISM artifacts go to Supabase.
Supabase creds already in `.env` (`VITE_SUPABASE_URL=https://bmeffxdjzdtiizhvhugj.supabase.co` + anon key);
`@supabase/supabase-js` NOT installed; helper `src/shared/lib/supabase.ts` was deleted as dead code.

## Closure progress update (auto-appended 2026-08-25)

- Step 3 DONE: closure commit `d3d8ef2` on main - "docs(prism): close phase 2 - correct
  verification ledger, mark plan complete, add state notes" (5 files, +239/-90).
- Remaining: step 4 final review (range fa002e1..5ae94c0), step 5 findings, step 6 drop
  stash (`\ = "stash@{0}"; git stash drop \`), step 7 push main + align feature branch
  (`git branch -f enhance/dev-vendor-restructure main; git push origin main enhance/dev-vendor-restructure`).
- Note: a graphify git hook prints to stderr on every commit; PowerShell renders it as a
  RemoteException. It is noise, not a failure - check `git log` to confirm success.
