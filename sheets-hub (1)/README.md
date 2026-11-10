# Sheets Hub / Work Hub

Single-page frontend + Supabase schema for viewing and managing Google Sheet-backed datasets.

## Files

- `index.html` — The whole app (HTML + CSS + JS). Uses Supabase JS v2 via CDN.
- `supabase/schema.sql` — Tables, roles, and Row Level Security. Safe to re-run.

## Setup

### 1. Database
1. Go to Supabase Dashboard > Your Project > SQL Editor > New query
2. Paste everything from `supabase/schema.sql`
3. Click **Run**

### 2. Frontend
1. Open `index.html` in a browser, or serve it:
   ```bash
   # Python
   python -m http.server 8000
   # then open http://localhost:8000
   ```
2. In the app, make sure your Supabase URL + anon key are configured (see `index.html`).

> Never commit a `service_role` key. Only use the `anon` / `publishable` key in the frontend.

## Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Work Hub frontend + Supabase schema"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/sheets-hub.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username.

## Later updates

```bash
git add .
git commit -m "Describe what you changed"
git push
```

## Tech

- HTML / CSS / JS (no build step)
- Supabase Auth + Postgres + RLS
- Google Sheets as data source (via `datasets.google_sheet_id`)
