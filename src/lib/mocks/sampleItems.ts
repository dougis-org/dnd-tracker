import {
  type Item,
  ItemCategory,
  ItemRarity,
  type ArmorType,
} from '@/types/item';

const SYSTEM_SOURCE = 'D&D 5e SRD';

type SystemItemInput = {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  rarity: ItemRarity;
  weight?: number | null;
  cost?: string | null;
  properties?: string[];
  damage?: string;
  damageType?: string;
  armorClass?: number;
  armorType?: ArmorType;
  strengthRequirement?: number;
  requiresAttunement?: boolean;
  tags?: string[];
  quantity?: number;
  uses?: string;
  source?: string;
};

function createSystemItem(input: SystemItemInput): Item {
  const pickOptional = (
    obj: Record<string, unknown>,
    keys: string[]
  ): Record<string, unknown> =>
    keys.reduce(
      (acc, key) => {
        if (obj[key]) acc[key] = obj[key];
        return acc;
      },
      {} as Record<string, unknown>
    );

  return {
    id: input.id,
    name: input.name,
    description: input.description,
    category: input.category,
    rarity: input.rarity,
    weight: input.weight ?? null,
    cost: input.cost ?? null,
    properties: input.properties ?? [],
    requiresAttunement: input.requiresAttunement ?? false,
    isSystemItem: true,
    source: input.source ?? SYSTEM_SOURCE,
    tags: input.tags ?? [],
    ...pickOptional(input, [
      'damage',
      'damageType',
      'armorClass',
      'armorType',
      'strengthRequirement',
      'quantity',
      'uses',
    ]),
  } as Item;
}

export const sampleItems: Item[] = [
  createSystemItem({
    id: 'srd-001',
    name: 'Longsword',
    description:
      'A well-balanced martial blade favored by knights and seasoned adventurers.',
    category: ItemCategory.Weapon,
    rarity: ItemRarity.Common,
    weight: 3,
    cost: '15 gp',
    damage: '1d8',
    damageType: 'Slashing',
    properties: ['Versatile (1d10)'],
  }),
  createSystemItem({
    id: 'srd-002',
    name: 'Shortsword',
    description:
      'A light, easily concealed blade popular with scouts and rogues.',
    category: ItemCategory.Weapon,
    rarity: ItemRarity.Common,
    weight: 2,
    cost: '10 gp',
    damage: '1d6',
    damageType: 'Piercing',
    properties: ['Finesse', 'Light'],
  }),
  createSystemItem({
    id: 'srd-003',
    name: 'Healing Potion',
    description:
      'A shimmering red liquid that restores vitality when consumed.',
    category: ItemCategory.Consumable,
    rarity: ItemRarity.Common,
    weight: 0.5,
    cost: '50 gp',
    properties: ['Regain 2d4 + 2 HP'],
  }),
];
