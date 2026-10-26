# WebApp Exam

React Router 8 Framework Mode, configured as a SPA with `ssr: false`.
Based on the official `create-react-router@latest` scaffold, using the project's existing CSS instead of the template's Tailwind styling.

## Commands

- `npm install` — install dependencies (Node 22.22+).
- `npm run dev` — start the React Router development server.
- `npm run build` — generate the static SPA in `build/client`.
- `npm run preview` — preview the production build locally.
- `npm run typecheck` — generate route types and check the new TypeScript framework files.

## Structure

- `app/root.tsx` — document shell and root outlet.
- `app/routes.ts` — framework route configuration.
- `app/routes/home.tsx` — temporary home page.
- `app/pages`, `app/components`, `app/user`, `app/supabaseClient.js`, and `app/index.css` — preserved original source, awaiting adaptation. Existing JavaScript is not included in the TypeScript check.

The original pages are not connected yet. Their old `react-router-dom` imports must be adapted to `react-router` when they are connected. The old `App.jsx` route map and `main.jsx` entry point are preserved in the sibling `WebApp_Exam-before-framework/src` backup.

For SPA data operations, use `clientLoader` and `clientAction`. The root shell is still rendered at build time, so keep its initial render independent of browser-only APIs.

## Netlify

`netlify.toml` builds the SPA, publishes `build/client`, and rewrites application URLs to `index.html`. If importing the parent repository, select `WebApp_Exam` as the base directory. Configure the existing environment variables in Netlify before deploying. No deployment has been performed.

