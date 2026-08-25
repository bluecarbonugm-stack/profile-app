# Phase 3 Design Spec: Supabase Content Backend + Admin Surface

**Date**: 2026-08-25
**Status**: DRAFT — pending user review
**Approach**: Server-only Supabase (Approach A)

## Overview

Replace the Google Apps Script spreadsheet with Supabase as the content backend
for the Blue Carbon Research Group web profile. Add a minimal `/admin` route
for a single authenticated editor to manage site content and upload images.

### Key Decisions

| Decision | Choice |
|----------|--------|
| Primary purpose | Replace Google Sheets with Supabase DB |
| Editors | Single admin only |
| Images | Upload to Supabase Storage (public bucket) |
| Fallback | Supabase primary → bundled `FALLBACK_CONTENT` |
| Admin route | Same app `/admin` (not a separate app) |
| Client-side Supabase | None — all reads/writes via TanStack server functions |

## 1. Supabase Schema

### Tables

All tables use `uuid` primary keys with `gen_random_uuid()` defaults. Timestamps
via `timestamptz` with `now()` defaults. Ordering via `sort_order int4`.

#### `site` (single row)

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | default gen_random_uuid() |
| `organization_name` | text NOT NULL | |
| `faculty` | text NOT NULL | |
| `department` | text NOT NULL | |
| `badge` | text NOT NULL | |
| `headline` | text NOT NULL | |
| `headline_emphasis` | text NOT NULL | |
| `headline_suffix` | text NOT NULL | |
| `intro` | text NOT NULL | |
| `about_title` | text NOT NULL | |
| `about_paragraphs` | text[] NOT NULL | Array of paragraphs |
| `address` | text | nullable |
| `email` | text | nullable |
| `phone` | text | nullable |
| `maps_url` | text | nullable |
| `hero_image` | text | nullable — Storage public URL |
| `founded_year` | text | nullable |

#### `stats`

| Column | Type |
|--------|------|
| `id` | uuid PK |
| `value` | text NOT NULL |
| `label` | text NOT NULL |
| `sort_order` | int4 NOT NULL |

#### `focus`

| Column | Type |
|--------|------|
| `id` | uuid PK |
| `icon` | text NOT NULL |
| `title` | text NOT NULL |
| `body` | text NOT NULL |
| `sort_order` | int4 NOT NULL |

#### `team`

| Column | Type |
|--------|------|
| `id` | uuid PK |
| `name` | text NOT NULL |
| `role` | text NOT NULL |
| `field` | text NOT NULL |
| `sort_order` | int4 NOT NULL |
| `photo_url` | text nullable |

#### `publications`

| Column | Type |
|--------|------|
| `id` | uuid PK |
| `year` | text NOT NULL |
| `type` | text NOT NULL |
| `title` | text NOT NULL |
| `authors` | text NOT NULL |
| `venue` | text NOT NULL |
| `sort_order` | int4 NOT NULL |

#### `gallery`

| Column | Type |
|--------|------|
| `id` | uuid PK |
| `title` | text NOT NULL |
| `caption` | text NOT NULL |
| `image_url` | text NOT NULL |
| `sort_order` | int4 NOT NULL |

#### `partners`

| Column | Type |
|--------|------|
| `id` | uuid PK |
| `name` | text NOT NULL |
| `sort_order` | int4 NOT NULL |

### Row-Level Security (RLS)

All tables have RLS enabled:

```sql
-- Public read for everyone
CREATE POLICY "Public read" ON {table}
  FOR SELECT USING (true);

-- Write requires authenticated user whose email matches ADMIN_EMAIL env var.
-- Since there is only one admin, we use a simple role check.
CREATE POLICY "Admin write" ON {table}
  FOR ALL USING (auth.role() = 'authenticated');
```

The admin check is enforced at the application layer (server functions verify
`auth.email() = ADMIN_EMAIL`), not purely via RLS, because RLS cannot read
env vars. The RLS `authenticated` role check is a second layer of defense.

### Seed Data

Initial migration seeds all tables with data from `FALLBACK_CONTENT` so the
site has content immediately after Supabase setup, even before the admin
logs in to customize.

## 2. Auth Model

### Login Flow

1. `/admin/login` renders a simple email + password form
2. Form submits to `POST /admin/login` (TanStack server function)
3. Server function calls `supabase.auth.signInWithPassword({ email, password })`
4. On success: sets session cookie, redirects to `/admin`
5. On failure: returns error message to form

### Session Management

- Supabase Auth manages JWTs stored in an httpOnly cookie
- Server functions read the cookie and verify the JWT via `supabase.auth.getUser()`
- No client-side Supabase client — all auth calls go through server functions

### Admin Verification

Every write operation checks:
1. User is authenticated (`supabase.auth.getUser()` returns a user)
2. User email matches `ADMIN_EMAIL` env var

If either check fails → 401 Unauthorized.

### Account Setup

- No registration flow — admin account created manually via Supabase Dashboard
- Seed SQL creates the initial admin user:
  ```sql
  INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
  VALUES ('admin@example.com', crypt('password', gen_salt('bf')), now());
  ```
- `ADMIN_EMAIL` env var must match the seeded email

### Logout

`POST /admin/logout` → `supabase.auth.signOut()` → clear cookie → redirect to `/admin/login`

### Route Protection

`/admin` route group uses TanStack layout route with auth check:
- If no session → redirect to `/admin/login`
- If session valid → render child route
- If `ADMIN_EMAIL` not set → 503 (misconfiguration)

## 3. Storage (Images)

### Bucket Configuration

- **Bucket name**: `site-images`
- **Visibility**: public (images displayed on the public profile page)
- **File size limit**: 2MB per file
- **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`

### Folder Structure

```
site-images/
  hero/           — hero image (single)
  team/           — team member photos
  gallery/        — gallery photos
```

### Upload Flow

1. Admin selects file in `/admin` UI (file input)
2. Client sends file to server function `uploadImage`
3. Server validates:
   - File size ≤ 2MB
   - MIME type in allowed list
   - User is authenticated admin
4. Server generates UUID filename: `{section}/{uuid}.{ext}`
5. Server uploads to Supabase Storage via `supabase.storage.from('site-images').upload()`
6. Server returns public URL
7. URL stored in the relevant DB row

### Image Cleanup

When an image URL is replaced or a row is deleted:
1. Extract the Storage path from the old URL
2. Delete the old file from Storage: `supabase.storage.from('site-images').remove([path])`

### No Image Transforms (Phase 3)

Images uploaded at full resolution. Responsive sizing via CSS `object-fit: cover`.
Can add Supabase Image Transform later if needed.

## 4. Admin UI

### Route Structure

```
/admin/login         — email + password form
/admin               — dashboard (overview)
/admin/site          — edit site record (single row form)
/admin/team          — list + add/edit/delete team members
/admin/publications  — list + add/edit/delete publications
/admin/gallery       — list + add/edit/delete gallery items (with image upload)
/admin/stats         — list + add/edit/delete stats
/admin/focus         — list + add/edit/delete focus areas
/admin/partners      — list + add/edit/delete partners
```

### UI Components

Reuses existing design system:
- `site-header.tsx` — nav bar with "Admin" link visible only when logged in
- Forms: simple controlled inputs, no form library (Zod for validation)
- Lists: table view with edit/delete buttons per row
- Image upload: file input + preview + upload button

### Key UX Decisions

- Each section is a separate page (not tabs) — simpler routing, matches TanStack file-based routes
- No rich text editor for `aboutParagraphs` — textarea with newline splitting (short academic paragraphs)
- Sort order editable via number input in list view (not drag-and-drop)

## 5. Content Loading Architecture

### Server-Side Content Read

New `content-source.ts` replaces Google Apps Script fetch:

```
loadProfileContent()
  → check in-memory cache (TTL 5 min, configurable via CONTENT_TTL_SECONDS)
  → if miss: query Supabase DB (site + all list tables)
  → validate with ProfileContentSchema (Zod)
  → merge with FALLBACK_CONTENT (same mergeWithFallback logic)
  → cache + return
```

### Server-Only Supabase Access

- Content reads use `SUPABASE_URL` + `SUPABASE_ANON_KEY` (server-only env vars, no `VITE_` prefix)
- Admin writes use `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- No `@supabase/supabase-js` in client bundle

### Admin Write Functions

Each CRUD operation is a separate TanStack server function:
- `create{Section}` — insert row, invalidate cache
- `update{Section}` — update row, invalidate cache, clean up old images
- `delete{Section}` — delete row, invalidate cache, clean up images

### Cache Invalidation

`invalidateProfileContentCache()` called after every write. Same in-memory
cache pattern as current `content-source.ts`.

### Fallback

If Supabase is unreachable → serve `FALLBACK_CONTENT` (same as current behavior
when Apps Script is down). Stale cached content served before fallback during
transient errors.

## 6. Environment Variables

```env
# Server-only (no VITE_ prefix — not in client bundle)
SUPABASE_URL=https://bmeffxdjzdtiizhvhugj.supabase.co
SUPABASE_ANON_KEY=eyJ...  # for content reads
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # for admin writes + storage
ADMIN_EMAIL=admin@bluecarbon.ugm.ac.id
CONTENT_TTL_SECONDS=300

# Existing (kept)
PROFILE_CONTENT_ENDPOINT=  # kept as fallback reference, no longer primary
```

## 7. Migration Plan

### Phase 3a: Schema + Content Loading (no admin UI yet)

1. Create Supabase project tables via SQL migration
2. Seed with `FALLBACK_CONTENT` data
3. Install `@supabase/supabase-js` (server dependency only)
4. Rewrite `content-source.ts` to read from Supabase instead of Apps Script
5. Keep `FALLBACK_CONTENT` as degradation
6. Verify public profile page works with Supabase content
7. Remove Google Apps Script endpoint dependency

### Phase 3b: Auth + Admin UI

8. Set up Supabase Auth (create admin account)
9. Create `/admin/login` page
10. Create `/admin` layout with auth guard
11. Build admin pages for each content section (CRUD)
12. Add image upload to gallery/team/hero

### Phase 3c: Polish

13. Image cleanup on delete/replace
14. Cache invalidation from admin writes
15. Error handling + loading states in admin UI
16. Remove old Google Apps Script code paths

## 8. Testing Strategy

### Backend

- Unit tests for `content-source.ts` (mock Supabase client, verify mergeWithFallback)
- Unit tests for admin write functions (mock Supabase client, verify auth check)
- Integration test: full content load from seed data

### Frontend

- Admin UI component tests (form validation, CRUD flows)
- Auth flow tests (login → session → logout)
- Public profile page unchanged (already tested)

### Manual

- End-to-end: login → edit team member → verify public page reflects change
- Image upload → verify displayed on gallery
- Supabase outage → verify fallback content served

## 9. Dependencies

### New

- `@supabase/supabase-js` — server-side only (not in client bundle)

### Unchanged

- TanStack Start/Router (existing)
- Zod (existing, for content validation)
- React + Vite (existing)

### Removed (after migration)

- Google Apps Script endpoint dependency (`PROFILE_CONTENT_ENDPOINT`)
- `PROFILE_CONTENT_TOKEN` env var

## 10. Out of Scope (Phase 3)

- Multiple admin users / role-based access
- Rich text editor for content
- Image transforms / CDN proxy
- PRISM artifact storage in Supabase
- Real-time content updates (Supabase Realtime)
- Content versioning / audit log
- Public user registration
