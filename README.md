# dnd-beyond-to-md

Convert a [D&D Beyond](https://www.dndbeyond.com/) magic item page into Markdown for apps like [Obsidian](https://obsidian.md/).

Now available in two ways:

- Web app (static, GitHub Pages): runs entirely in your browser; downloads a .md file. No server.
- CLI (original): automated with puppeteer and Google auth.

---

## Web app (recommended)

The web UI lives under `docs/` so it can be hosted by GitHub Pages.

Deploy on your fork:

1. Push to `main` with the `docs/` folder (already included).
2. In GitHub → Settings → Pages, set Source to “Deploy from a branch”, Branch: `main`, Folder: `/docs`.
3. Open the published URL (something like `https://<you>.github.io/dnd-beyond-to-md/`).

Usage options in the web UI:

- Enter URL: Works only if the page is public and CORS allows fetching.
- Paste HTML: Copy-paste the page’s HTML source into the textarea, then convert.
- Bookmarklet: Drag the button to your bookmarks bar, open an item on dndbeyond.com, click it. This is the most reliable for logged-in content since it reads the live DOM in your browser session.

Direct bookmarklet page: once Pages is enabled, open `https://<you>.github.io/dnd-beyond-to-md/docs/bookmarklet.html` and drag the “DDB → MD” link to your bookmarks bar.

Notes:

- All parsing happens locally in your browser. No data is sent anywhere.
- If CORS or login blocks fetching, use the Bookmarklet or Paste HTML options.
- Scraping may be subject to the site’s Terms of Service; use responsibly.

---

## CLI (original)

Install:

```bash
git clone git@github.com:burntcustard/dnd-beyond-to-md.git
cd dnd-beyond-to-md
npm install
```

Run:

```bash
npx tsx index.ts --google-user=example@gmail.com --url=https://www.dndbeyond.com/magic-items/4568-amulet-of-health
```

The CLI logs in (using a passkey via Google) and saves a Markdown file under `exports/`.

---

## How it works

Both the web app and CLI extract:

- name, info line, item type, rarity, attunement
- source, URL
- description and optional Notes
- a rough price heuristic based on rarity (consumables at half cost)

Output frontmatter matches the CLI:

```yaml
---
attunement: <boolean>
cost: <number>
item type: <string>
rarity: <string>
source: <string>
url: <string>
---
```

And the body mirrors the item info and description.
