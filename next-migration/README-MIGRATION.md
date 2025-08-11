Skinstric Next.js Migration
===========================

This folder contains the migrated Next.js version of the original CRA app.

Key Points:
- Using App Router (app/) with a single client page (page.js) hosting the stage state machine.
- GSAP animations applied client-side only ("use client" at top of page.js).
- Customer form logic preserved; name from intro screen passed into form (initialName prop).
- Global styles merged from CRA's index.css into app/globals.css (template boilerplate removed).
- Unused Next.js scaffold assets (SVGs, fonts, CSS module) removed for clarity.

Commands:
- Development: npm run dev
- Production build: npm run build && npm start
- Lint: npm run lint

Future Improvements:
- Add accessibility enhancements (ESC to close form, focus trap).
- Add dynamic import for potential Three.js scene (ssr:false) when integrated visually.
- Consider splitting stages into separate routes if navigation expands.

Security:
- CRA toolchain vulnerabilities eliminated (new dependency tree had 0 vulns at creation).

Deployment:
- Deploy to Vercel by importing this subdirectory as a separate project, or move contents to repo root and remove CRA project.
