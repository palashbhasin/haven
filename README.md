# Haven

Stop scams before they reach your family.

Haven is a small landing page for an AI-powered scam detection product. It quietly watches a parent's inbox and flags scams before they cause harm.

## What's in here

- `index.html` — the landing page (loads React, Tailwind, and the JSX below from a CDN)
- `Haven.jsx` — the full React component: hero, live AI demo, inbox before/after, roadmap, waitlist

## Run locally

This is a static site. Open `index.html` in a browser, or serve the folder with any static server:

```bash
# Python
python3 -m http.server 8000

# or Node
npx serve .
```

Then visit http://localhost:8000.

## Deploy on Replit

1. Import this repo into Replit (Create App → Import from GitHub)
2. Pick the **HTML, CSS, JS** template
3. Run — Replit serves `index.html` automatically and gives you a public URL

## Deploy on GitHub Pages

1. Repo → Settings → Pages
2. Source: `main` branch, root folder
3. Save — GitHub publishes to `https://<your-username>.github.io/<repo-name>/`

## Waitlist

Submissions go to Formspree form `xrerveyw`. Check signups at [formspree.io](https://formspree.io).

## Notes

- JSX is transpiled in the browser via Babel standalone — fine for a landing page, slow for production traffic. If this gets real visitors, move it into a Vite + React project so JSX is pre-built.
- The "live AI" demo expects `window.claude.complete` to exist (provided by the prototype host). On a real domain, swap that call for your own backend that proxies Anthropic.
