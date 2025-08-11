Consolidated Next.js App
========================

The project has been migrated from Create React App to Next.js (app/ directory) and the legacy CRA source under src/ was removed.

Remaining legacy public assets (logo*.png, manifest.json, robots.txt) are unused and can be safely deleted later if not needed for PWA/icons.

Scripts:
  npm run dev   - start Next.js dev server
  npm run build - production build
  npm start     - run production server

Structure:
  app/             - Next.js App Router pages and components
  app/components   - UI components including CustomerForm
  app/page.js      - Main landing + intro + form state machine
  app/globals.css  - Global styles migrated from CRA

Next Steps:
  - Add additional routes/pages as needed under app/
  - Implement accessibility enhancements (ESC close, focus trap)
  - Add tests (Playwright/Jest) for form + navigation
  - Remove unused public assets when convenient

Security:
  - CRA vulnerabilities removed; using Next.js toolchain.
