// Shared extraction + markdown generation helpers, matching index.ts exactly.

export type ItemData = {
  name: string;
  info: string;
  rarity: string; // Display value (mapped), same as index.ts
  itemType: string;
  description: string;
  notes: string;
  attunement: boolean;
  cost: number;
  source: string;
  url: string;
};

export function extractFromStrings({
  name,
  itemInfo,
  source,
  description,
  url,
}: {
  name: string;
  itemInfo: string;
  source: string;
  description: string;
  url: string;
}): ItemData {
  // Mirror index.ts rarity and type parsing and mapping behavior
  const rarity = itemInfo?.match(/\b(common|uncommon|rare|very rare|legendary|artifact|varies)\b/i)?.[1] ?? 'unknown';
  const itemType = itemInfo?.match(/\b(adventuring gear|armor|potion|ring|rod|scroll|staff|wand|weapon|wondrous item)\b/i)?.[1] ?? 'unknown';

  const notes = description.includes('Notes') ? description.split('Notes: ')[1].trim() : '';
  const consumable = notes?.toLowerCase().includes('consumable') ?? false;

  const data: ItemData = {
    name: name.trim(),
    info: itemInfo.trim(),
    rarity: ({
      common: 'Common',
      uncommon: 'Uncommon',
      rare: 'Rare',
      veryRare: 'Very Rare',
      legendary: 'Legendary',
      artifact: 'Artifact',
      unknown: 'Unknown Rarity',
    } as Record<string, string>)[rarity] ?? 'Unknown Rarity',
    itemType,
    description: description.split('Notes')[0].trim().replace('\n', '\n\n') ?? '',
    notes,
    attunement: itemInfo.includes('requires attunement'),
    cost:
      (({
        common: 100,
        uncommon: 400,
        rare: 4000,
        veryRare: 40000,
        legendary: 200000,
      } as Record<string, number>)[rarity] ?? 0) * (consumable ? 0.5 : 1),
    source: source.trim().split(',')[0].replace('Dungeon Master’s Guide', 'DMG') ?? 'Unknown Source',
    url,
  };

  return data;
}

export function toMarkdown(data: ItemData): string {
  // Exactly match index.ts `content` template (including whitespace and trailing newline)
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
  return content;
}

// TypeScript implementation of the bookmarklet logic. This function is converted to a
// javascript: payload at build time using toString(), so keep it self-contained.
export function bookmarkletMain(): void {
  try {
    const text = (el: Element | null) => (el?.textContent || '').trim();

    const name = text(document.querySelector('.page-title')) || 'Unknown Item';
    const itemInfo = text(document.querySelector('.item-info .details')) || '';
    const source = text(document.querySelector('.source.item-source')) || 'Unknown Source';
    const description = text(document.querySelector('.more-info-content')) || '';

    // Inline extractFromStrings equivalent
    const rarityMatch = itemInfo.match(/\b(common|uncommon|rare|very rare|legendary|artifact|varies)\b/i);
    const rarityKey = (rarityMatch?.[1] ?? 'unknown') as string;
    const itemTypeMatch = itemInfo.match(/\b(adventuring gear|armor|potion|ring|rod|scroll|staff|wand|weapon|wondrous item)\b/i);
    const itemType = (itemTypeMatch?.[1] ?? 'unknown') as string;

    const notes = description.includes('Notes') ? description.split('Notes: ')[1].trim() : '';
    const consumable = notes.toLowerCase().includes('consumable');

    const rarityDisplay = (
      {
        common: 'Common',
        uncommon: 'Uncommon',
        rare: 'Rare',
        veryRare: 'Very Rare',
        legendary: 'Legendary',
        artifact: 'Artifact',
        unknown: 'Unknown Rarity',
      } as Record<string, string>
    )[rarityKey] ?? 'Unknown Rarity';

    const costBase = (
      {
        common: 100,
        uncommon: 400,
        rare: 4000,
        veryRare: 40000,
        legendary: 200000,
      } as Record<string, number>
    )[rarityKey] ?? 0;

    const data = {
      name: name.trim(),
      info: itemInfo.trim(),
      rarity: rarityDisplay,
      itemType,
      description: description.split('Notes')[0].trim().replace('\n', '\n\n') ?? '',
      notes,
      attunement: itemInfo.includes('requires attunement'),
      cost: costBase * (consumable ? 0.5 : 1),
      source: source.trim().split(',')[0].replace('Dungeon Master’s Guide', 'DMG') ?? 'Unknown Source',
      url: location.href,
    };

    // Inline toMarkdown equivalent (exactly matches index.ts formatting)
    const md = `${`
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

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.name}.md`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 100);
  } catch (e: unknown) {
    const msg = typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : String(e);
    alert('DDB → MD error: ' + msg);
  }
}
