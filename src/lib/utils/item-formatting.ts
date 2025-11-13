import { Item, ItemRarity } from '@/types/item';

export const rarityStyles: Record<ItemRarity, string> = {
  [ItemRarity.Common]: 'bg-slate-100 text-slate-800 border border-slate-200',
  [ItemRarity.Uncommon]:
    'bg-emerald-100 text-emerald-800 border border-emerald-200',
  [ItemRarity.Rare]: 'bg-sky-100 text-sky-800 border border-sky-200',
  [ItemRarity.VeryRare]:
    'bg-purple-100 text-purple-800 border border-purple-200',
  [ItemRarity.Legendary]: 'bg-amber-100 text-amber-900 border border-amber-200',
  [ItemRarity.Artifact]: 'bg-rose-100 text-rose-800 border border-rose-200',
};

export function formatWeight(weight?: number | null): string {
  if (weight === null || typeof weight === 'undefined') {
    return '—';
  }
  const roundedWeight = Number.isInteger(weight)
    ? weight
    : Number(weight.toFixed(1));
  return `${roundedWeight} lb${roundedWeight === 1 ? '' : 's'}`;
}

export function formatProperties(properties?: string[]): string {
  if (!properties || properties.length === 0) {
    return 'No special properties';
  }

  if (properties.length === 1) {
    return properties[0];
  }

  return `${properties[0]} +${properties.length - 1} more`;
}

export function resolveSource(item: Item): string {
  if (!item.isSystemItem) {
    return 'User Created';
  }
  return item.source ?? 'System Catalog';
}
