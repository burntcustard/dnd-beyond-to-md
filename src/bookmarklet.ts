export async function bookmarklet(): Promise<void> {
    // @ts-ignore - allow importing by URL in this inline bookmarklet function
    const { default: htmlToMarkdown } = await import('https://esm.sh/@wcj/html-to-markdown@2.1.1?bundle&target=es2024');
    const name = (document.querySelector('.page-title')?.textContent ?? '').trim() || 'Unknown Item';
    const itemInfo = (document.querySelector('.item-info .details')?.textContent ?? '').trim();
    const source = (document.querySelector('.source.item-source')?.textContent ?? '').trim() || 'Unknown Source';
    let descriptionHTML = (document.querySelector('.more-info-content') as HTMLElement | null)?.innerHTML ?? '';
    descriptionHTML = descriptionHTML.replace(/href\s*=\s*"\/(.*?)"/g, 'href="https://www.dndbeyond.com/$1"');
    const description = await htmlToMarkdown({ html: descriptionHTML });
    const rarity = itemInfo?.match(/\b(common|uncommon|rare|very rare|legendary|artifact|varies)\b/i)?.[1] ?? 'unknown'
    const itemTypeMatch = itemInfo.match(/\b(adventuring gear|armor|potion|ring|rod|scroll|staff|wand|weapon|wondrous item)\b/i);
    const itemType = (itemTypeMatch?.[1] ?? 'unknown');
    const notes = description.includes('Notes') ? description.split('Notes: ')[1].trim() : '';
    const consumable = notes.toLowerCase().includes('consumable');

    const rarityDisplay = {
      'common': 'Common',
      'uncommon': 'Uncommon',
      'rare': 'Rare',
      'very rare': 'Very Rare',
      'legendary': 'Legendary',
      'artifact': 'Artifact',
    }[rarity] ?? 'Unknown Rarity';

    const cost = ({
      'common': 100,
      'uncommon': 400,
      'rare': 4000,
      'very rare': 40000,
      'legendary': 200000,
    }[rarity] ?? 0) * (consumable ? 0.5 : 1);

    const md = `${`
---
attunement: ${itemInfo.includes('requires attunement')}
cost: ${cost * (consumable ? 0.5 : 1)}
item type: ${itemType}
rarity: ${rarityDisplay}
source: ${source.split(',')[0].replace('Dungeon Master’s Guide', 'DMG')}
url: ${location.href}
---

# ${name}

*${itemInfo}*

${description.split('Notes')[0].trim() ?? ''}

${notes ? `*Notes: ${notes}*` : ''}
    `.trim()}\n`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.md`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 100);
}
