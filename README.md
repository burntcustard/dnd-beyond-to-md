# dnd-beyond-to-md

Convert a [D&D Beyond](https://www.dndbeyond.com/) magic item page into Markdown for apps like [Obsidian](https://obsidian.md/).

Available as a bookmarklet at or as an automated CLI tool which accepts a URL and a Google username.

## Bookmarklet

1. Visit [burnt.io/dnd-beyond-to-md](https://burnt.io/dnd-beyond-to-md/).
2. Bookmark the button link by dragging it into your bookmarks toolbar or copy-pasting the link into a new bookmark.
3. Visit a magic item page on [D&D Beyond](https://www.dndbeyond.com/) like [Boots of Speed](https://www.dndbeyond.com/magic-items/4589-boots-of-speed).
4. Click the bookmarklet.
5. Receive markdown.

## CLI

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

The CLI logs in (using a passkey via Google) and saves a Markdown file in `exports/`.

---

## How it works

Both the web app and CLI extract the same information out of the magic item page, putting the description in the body of the markdown file, with additional YAML properties:

```yaml
---
attunement: <boolean> // Boolean true or false of whether or not the item requires attunement.
cost: <number>        // Price number in gold pieces based on rarity, with consumables at half cost.
item type: <string>   // E.g. adventuring gear, armor, potion, wondrous item.
rarity: <string>      // common, uncommon, rare, ... artifact, or varies.
source: <string>      // Source book. Shortends "Dungeon Master's Guide" to just "DMG".
url: <string>         // The D&D Beyond source URL.
---
```
