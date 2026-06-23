# Deploying Mona Shores Flats on Cloudflare

The site is a static page (`index.html` + `img/`), so it deploys to **Cloudflare Pages**.
The AI chatbot uses a separate **Cloudflare Worker** (`cloudflare-worker.js`). Both live in the same
Cloudflare account.

There are two ways to put the site live. **Route A (dashboard) is recommended** — it auto-redeploys
every time you push to the branch.

---

## Route A — Connect the GitHub repo (recommended, auto-deploys)

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Authorize GitHub and pick **`Grantg2002/mona-shores-flats`**.
3. Configure the build:
   - **Production branch:** `claude/website-yardi-integration-erxge0` (or `main` after you merge).
   - **Framework preset:** `None` (or `Eleventy`)
   - **Build command:** `npm run build`
   - **Build output directory:** `_site`  (Eleventy renders the site into `_site/`)
4. **Save and Deploy.**

You'll get a live URL like **`https://mona-shores-flats.pages.dev`** in under a minute. Every future
push to that branch redeploys automatically. Add a custom domain (e.g. `monashoresflats.com`) later in
the project's **Custom domains** tab.

---

## Route B — One command from your machine (Wrangler CLI)

```bash
npm install                       # installs Eleventy + wrangler
npx wrangler login                # opens browser, logs into YOUR Cloudflare account
npm run deploy:site               # builds with Eleventy, then uploads _site to Cloudflare Pages
```

`npm run deploy:site` runs `npm run build && wrangler pages deploy _site --project-name=mona-shores-flats`.
First run creates the project and prints the `*.pages.dev` URL.

To preview locally before deploying: `npm run dev` (serves at http://localhost:8080 with live reload).

---

## Don't forget: point the chatbot at your Worker

The page expects the AI proxy Worker URL. In `index.html`:

```js
const AI_PROXY_URL = 'https://msf-chat.YOURSUBDOMAIN.workers.dev'; // ← replace after deploying the Worker
```

Deploy the Worker (`npm run deploy:chat`, which runs `wrangler deploy cloudflare-worker.js`), add the
`GROQ_API_KEY` secret in the Worker's settings, then paste its real URL here. Until then the chatbot
still works via its scripted flows and keyword matching — only the free-text AI fallback is disabled.

---

## Notes

- The site is built by **Eleventy** from `src/` into `_site/` (which is git-ignored). Only `_site/` is
  deployed, so `docs/`, `supabase/`, `reference/`, and `cloudflare-worker.js` stay out of the public bundle.
- Source structure: `src/_data/site.json` (all content — pricing, amenities, NAP, URLs in one place),
  `src/_includes/` (base layout + nav + footer), `src/assets/` (css/js), `src/img/`, and one `.njk` file
  per page. Edit `site.json` once and every page updates.
- Pages serves over HTTPS automatically.
