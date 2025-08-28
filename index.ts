import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

const browser = await puppeteer.launch({
  headless: false,
  userDataDir: './.chrome-profile',
  args: [
    '--window-size=1280,800',
    '--disable-blink-features=AutomationControlled'
  ]
});
const [page] = await browser.pages();
await page.setViewport({ width: 1280, height: 800 });
await page.goto('https://www.dndbeyond.com/');

try {
  await page.waitForSelector('#login-link', { timeout: 1000 });
  await page.click('#login-link');
  await (await page.waitForSelector('#signin-with-google'))?.click();

  const popup: Page = await new Promise((resolve, reject) =>
    page.once('popup', p => p ? resolve(p) : reject())
  );

  const googleUser = process.argv.find(arg => arg.startsWith('--google-user='))?.split('=')[1];
  if (!googleUser) throw new Error('Missing --google-user argument');

  try {
    await popup.waitForSelector(`[data-identifier="${googleUser}"]`, { timeout: 1000 }).then(el => el?.click());
  } catch {
    await (await popup.waitForSelector('input[type="email"]'))?.type(googleUser);
    await popup.click('#identifierNext');
    await popup.waitForSelector('text/Try another way').then(el => el?.evaluate(el => (el as HTMLElement).click()));
    await popup.waitForSelector('text/Use your passkey').then(el => el?.evaluate(el => (el as HTMLElement).click()));
    await popup.waitForSelector('text/Continue').then(el => el?.evaluate(el => (el as HTMLElement).click()));
  }

  await new Promise<void>(resolve => popup.once('close', () => page.waitForNavigation().then(() => resolve())));
  console.info(`Logged in as ${googleUser}`);
} catch {
  console.info('Already logged in');
}

// Go to magic item page that we want to scrape
const url = process.argv.find(arg => arg.startsWith('--url='))?.split('=')[1];
if (!url) throw new Error('Missing --url argument');

await page.goto(url);

await page.waitForSelector('.page-title');
const name = await page.$eval('.page-title', el => el.textContent);
const itemInfo = await page.$eval('.item-info .details', el => el.textContent);
const source = await page.$eval('.source.item-source', el => el.textContent);
const description = await page.$eval('.more-info-content', el => el.textContent);
const rarity = itemInfo?.match(/\b(common|uncommon|rare|very rare|legendary|artifact|varies)\b/i)?.[1] ?? 'unknown';
const itemType = itemInfo?.match(/\b(adventuring gear|armor|potion|ring|rod|scroll|staff|wand|weapon|wondrous item)\b/i)?.[1] ?? 'unknown';
const consumable = itemInfo?.toLowerCase().includes('consumable') ?? false;

const data = {
  name: name.trim(),
  info: itemInfo.trim(),
  rarity: {
    common: 'Common',
    uncommon: 'Uncommon',
    rare: 'Rare',
    veryRare: 'Very Rare',
    legendary: 'Legendary',
    artifact: 'Artifact',
    unknown: 'Unknown Rarity',
  }[rarity],
  itemType,
  description: description.split('Notes')[0].trim().replace('\n', '\n\n') ?? '',
  notes: description.includes('Notes') ? description.split('Notes: ')[1].trim() : '',
  attunement: itemInfo.includes('requires attunement'),
  cost: ({
    common: 100,
    uncommon: 400,
    rare: 4000,
    veryRare: 40000,
    legendary: 200000,
  }[rarity] ?? 0) * (consumable ? 0.5 : 1),
  source: source.trim().split(',')[0].replace('Dungeon Master’s Guide', 'DMG') ?? 'Unknown Source',
  url,
};

console.log(data);

const content = `${`
---
attunement: ${data.attunement}
cost: ${data.cost}
item type: ${data.itemType}
rarity: ${data.rarity}
source: ${data.source}
url: ${data.url}
---

# ${data.name}

*${data.info}*

${data.description}

${data.notes ? `*Notes: ${data.notes}*` : ''}
`.trim()}\n`;

const exportsDir = 'exports';

if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir);
}

const filePath = path.join(exportsDir, `${data.name}.md`);
fs.writeFileSync(filePath, content, 'utf8');
console.log(`Markdown file created: ${filePath}`);

await browser.close();
