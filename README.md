# Workforce Shell

The independently deployed Module Federation host for Workforce Hub. It owns browser history, top-level routes, remote loading, Bulma, shell layout CSS, and the `@r01al/mfe-workforce-common-client` base stylesheet. Its production server and Webpack setup come from `@r01al/mfe-workforce-common-server`.

```bash
npm install
npm run dev
npm run typecheck
npm run build
npm start
```

Production builds read `MFE_NAVIGATION_URL`, `MFE_HEADER_URL`, `MFE_OVERVIEW_URL`, `MFE_CALENDAR_URL`, `MFE_WORKERS_URL`, and `MFE_SETTINGS_URL`. Each value must point to a complete `remoteEntry.js` URL.
