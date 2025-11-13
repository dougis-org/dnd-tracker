import { Item, ItemCategory, ItemRarity } from '../../src/types/item';

function createMockItem(overrides: Partial<Item> & { id: string; name: string }): Item {
  const optionalFields = ['damage', 'damageType', 'armorClass', 'armorType', 'strengthRequirement', 'quantity', 'uses'];
  const optional = Object.fromEntries(
    Object.entries(overrides).filter(([key]) => optionalFields.includes(key))
  );

  return {
    id: overrides.id,
    name: overrides.name,
    description: overrides.description || '',
    category: overrides.category || ItemCategory.Weapon,
    rarity: overrides.rarity || ItemRarity.Common,
    weight: overrides.weight !== undefined ? overrides.weight : null,
    cost: overrides.cost || null,
    properties: overrides.properties || [],
    requiresAttunement: overrides.requiresAttunement ?? false,
    isSystemItem: overrides.isSystemItem ?? true,
    source: overrides.source || 'System Catalog',
    tags: overrides.tags || [],
    ...optional,
  } as Item;
}

export const mockItemLongswordOfDawn: Item = createMockItem({
  id: 'item-1',
  name: 'Longsword of Dawn',
  description: 'A radiant blade that shines with the light of dawn.',
  category: ItemCategory.Weapon,
  rarity: ItemRarity.Rare,
  weight: 3,
  cost: '120 gp',
  properties: ['Versatile (1d10)', '+1 to attack and damage rolls'],
  damage: '1d8',
  damageType: 'Slashing',
  requiresAttunement: true,
});

export const mockItemHealingPotion: Item = createMockItem({
  id: 'item-2',
  name: 'Healing Potion',
  description: 'Restores a small amount of hit points when consumed.',
  category: ItemCategory.Consumable,
  rarity: ItemRarity.Common,
  weight: 0.5,
  cost: '50 gp',
  properties: ['Regain 2d4 + 2 HP'],
});

export const mockItemWarhammerOfMountain: Item = createMockItem({
  id: 'item-3',
  name: 'Warhammer of the Mountain',
  description: 'A heavy hammer that channels the strength of the earth.',
  category: ItemCategory.Weapon,
  rarity: ItemRarity.Uncommon,
  weight: 2,
  cost: '180 gp',
  properties: ['Versatile (1d10)'],
  damage: '1d8',
  damageType: 'Bludgeoning',
  requiresAttunement: true,
});

export const mockItemsList: Item[] = [
  mockItemLongswordOfDawn,
  mockItemHealingPotion,
  mockItemWarhammerOfMountain,
];
