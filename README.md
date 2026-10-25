# *41 — A personal space

A tactile, typography-led website with original content and four small interactive demos. Built with browser-native HTML, CSS, and JavaScript modules. Production has no package dependencies or build step. Fonts are self-hosted. DM Sans and IBM Plex Mono include their OFL licenses in `dist/assets/fonts/`; the supplied Helvetica Neue files are a separate, proprietary family.

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

These DOM checks do not verify pixel layout, browser-native focus trapping, native Escape handling, or device touch behavior. Browser visual QA was blocked during the initial build. The Helvetica Neue update was subsequently spot-checked in Chrome on the homepage at desktop and narrower window sizes and on the desktop Lab list. A complete responsive / accessibility pass remains outstanding, including 320 / 390 / 768 / 1440px widths, both themes, reduced motion, and horizontal overflow.

## Deployment

The static publication root is `dist/`. Configure other hosts to rewrite unknown document routes to `index.html` for client-side navigation. `.openai/hosting.json` records this Site’s identity and deployment directory. Source files and tests live alongside the publication root.

## Typography

Headings, the *41 branding, oversized Lab titles, and the typography demo use the supplied **Helvetica Neue Bold**. Body text remains **DM Sans**, and technical labels remain **IBM Plex Mono**, as requested. The favicon contains outlines from the same Helvetica Neue Bold face, so it needs no font download.

The supplied `helvetica-neue-5.zip` contains Bold (700), Bold Italic (700), Heavy (800), and Heavy Italic (800). These real weights and styles are registered as self-hosted WOFF2 files in `dist/assets/fonts/helvetica-neue/`. Heavy and italic faces are available to use when needed; they are downloaded only if a matching style is displayed. Regular and Medium were not included and are not simulated with a bold font.

The Helvetica Neue files were supplied by the site owner and are not covered by the DM Sans / IBM Plex Mono OFL licenses. No separate Helvetica Neue license document was included in the supplied ZIP.

The reference preloads Oracle Variable. This site does not reuse that font, its imagery, personal information, or projects.
