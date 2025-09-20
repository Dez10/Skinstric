# Skinstric (Next.js App)

Skinstric is a Next.js app that analyzes a selfie to predict demographics (race/age/sex) and presents results with a clean, Figma-accurate UI. It uses the App Router, session-backed client state, and Tailwind v4 (via PostCSS) for utilities alongside custom CSS.

## Tech Stack

- Next.js 15 (App Router)
- React 19
- Tailwind CSS v4 (PostCSS plugin)
- GSAP (optional animations)

## Local Development

1. Install dependencies
2. Start the dev server at http://localhost:3000

```
npm install
npm run dev
```

## Scripts

- `npm run dev` – Start development server
- `npm run build` – Build for production
- `npm start` – Serve production build locally
- `npm run lint` – Lint the codebase

## Project Structure

- `app/` – Next.js app router pages and components
  - `app/result` – Analysis landing (rings + diamond cluster)
  - `app/select` – Choose image source / proceed
  - `app/summary` – Demographics summary, editable picks, animated arc
- `app/components` – Reusable UI and providers
- `public/` – Static assets
- `_reference/` – Design references and legacy static exports (not deployed)
- `next-migration/` and `src/` – Legacy/experimental code (not deployed)

## Environment

No secrets required by default. If you add APIs later, create a `.env.local` and reference `process.env.NEXT_PUBLIC_*` for client or server-only env vars as needed.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import the repo in Vercel and select the Next.js preset.
3. No custom build settings required (`next build`).
4. `.vercelignore` excludes heavy folders: `_reference/`, `next-migration/`, `src/`.

## Notes

- CSS shows `@tailwind` at-rule warnings in editor; build is handled by PostCSS/Tailwind.
- Summary’s right panel scrolls when needed, center ring animates to selected value.
