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
   - **Framework preset:** `None`
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/`  (the site is at the repo root)
4. **Save and Deploy.**

You'll get a live URL like **`https://mona-shores-flats.pages.dev`** in under a minute. Every future
push to that branch redeploys automatically. Add a custom domain (e.g. `monashoresflats.com`) later in
the project's **Custom domains** tab.

---

## Route B — One command from your machine (Wrangler CLI)

```bash
npm install                       # installs wrangler (devDependency)
npx wrangler login                # opens browser, logs into YOUR Cloudflare account
npm run deploy:site               # uploads the current folder to Cloudflare Pages
```

`npm run deploy:site` runs `wrangler pages deploy . --project-name=mona-shores-flats`.
First run creates the project and prints the `*.pages.dev` URL.

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

- Deploying the repo root also uploads `docs/`, `supabase/`, and `cloudflare-worker.js` as static files.
  They're harmless (no secrets are in source — secrets live in Cloudflare/Supabase env), just unused.
  If you want a clean deploy later, move `index.html` + `img/` into a `public/` folder and set the build
  output directory to `public`.
- Pages serves over HTTPS automatically.
