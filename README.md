# dnd-beyond-to-md

A tool to scrape [D&D Beyond](https://www.dndbeyond.com/) to fetch and convert magic item info into .md files for markdown editors like [Obsidian](https://obsidian.md/).

Currently only supports Google Authentication via passkey.

### Install
```bash
git clone git@github.com:burntcustard/dnd-beyond-to-md.git
```
```bash
cd dnd-beyond-to-md
```
```bash
npm install
```

### Usage
```bash
npx tsx index.ts --google-user=example@gmail.com --url=https://www.dndbeyond.com/magic-items/4568-amulet-of-health
```

