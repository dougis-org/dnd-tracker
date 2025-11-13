export enum ItemCategory {
  Weapon = 'Weapon',
  Armor = 'Armor',
  Accessory = 'Accessory',
  Consumable = 'Consumable',
  Wondrous = 'Wondrous Item',
  Rod = 'Rod',
  Staff = 'Staff',
  Wand = 'Wand',
  Potion = 'Potion',
  Scroll = 'Scroll',
}

export enum ItemRarity {
  Common = 'Common',
  Uncommon = 'Uncommon',
  Rare = 'Rare',
  VeryRare = 'Very Rare',
  Legendary = 'Legendary',
  Artifact = 'Artifact',
}

export enum ArmorType {
  Light = 'Light Armor',
  Medium = 'Medium Armor',
  Heavy = 'Heavy Armor',
  Shield = 'Shield',
}

export interface Item {
  id: string
  name: string
  description: string
  category: ItemCategory
  rarity: ItemRarity
  weight: number | null
  cost: string | null
  properties: string[]
  damage?: string
  damageType?: string
  armorClass?: number
  armorType?: ArmorType
  strengthRequirement?: number
  requiresAttunement: boolean
  isSystemItem: boolean
  source: string
  tags: string[]
  quantity?: number
  uses?: string
}
