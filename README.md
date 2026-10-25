# *41 — A personal space

A tactile, typography-led website with original content and four small interactive demos. Built with browser-native HTML, CSS, and JavaScript modules. Production has no package dependencies or build step. Fonts are self-hosted, with their OFL licenses in `dist/assets/fonts/`.

## Run locally

From this folder, run `npm run dev`, then open **http://localhost:4173**. Node 20 or later is recommended. The server handles direct entry to every route.

## Personalize

Edit `dist/content.js`:

- `personal`: name, introduction, biography, interests, what you’re exploring, portrait, and public email.
- `concept`: four editable sections describing the space, without assigning a meaning to “41”.
- `experiments`: the shared dataset for List, Wheel, Grid, and search. Use `[]` for the designed empty state.
- `personal.contactEndpoint`: remains `null` until delivery is configured. The contact form explicitly previews letters and makes no network request in this state.

Put an actual portrait in `dist/assets/` and set its URL and alt text. The current stamp intentionally says “Portrait to come.” No biography, credentials, location, clients, or achievements have been invented.

## Contact integration

Set `contactEndpoint` to your own server endpoint. It receives a JSON POST containing `reason`, `email`, `message`, and `name`. The server must validate inputs, send the email using server-side credentials, and return a 2xx response with `{ "ok": true }` only after successful delivery handling. Other responses and timeouts preserve the draft and display an error. Never put a mail-provider secret in these static files.

## Features

- `/`, `/about`, `/lab`, `/concept`, `/contact`, and `/lab/:experiment-id`.
- Stable shell, one intro per browser session, centered tabular counter, and real requestAnimationFrame-based FPS samples.
- System-aware themes with remembered manual choices, set before CSS loads.
- Command palette using a native modal dialog: Ctrl/Cmd+K, arrows, Enter, Escape, focus return, touch selection, and empty results.
- Wheel selection by pointer/touch drag, scroll, arrow keys, Home/End, or previous/next buttons. Opening is a separate action, avoiding navigation during a drag.
- Keyboard-operable controls, natural page scroll, responsive paper compositions, and reduced-motion handling.

## Checks

Run `npm install` then `npm run check`. `happy-dom` is a development-only test dependency. The tests cover routes, datasets, search, DOM interactions, wheel gestures, theme persistence, intro completion, FPS updates, contact preview/delivery behavior, and each demo.

These DOM checks do not verify pixel layout, browser-native focus trapping, native Escape handling, or device touch behavior. Browser visual QA was blocked by the computer-use safety gate during this build. Those checks remain to be performed in a real browser, including 320 / 390 / 768 / 1440px widths, both themes, reduced motion, and horizontal overflow.

## Deployment

The static publication root is `dist/`. Configure other hosts to rewrite unknown document routes to `index.html` for client-side navigation. `.openai/hosting.json` records this Site’s identity and deployment directory. Source files and tests live alongside the publication root.

The reference preloads Oracle Variable. This original design uses DM Sans and IBM Plex Mono instead, and does not reuse the reference’s imagery, personal information, projects, or proprietary fonts.
