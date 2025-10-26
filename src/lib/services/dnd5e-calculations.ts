export type AbilityScoreKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'

export interface AbilityScores {
  str: number
  dex: number
  con: number
  int: number
  wis: number
  cha: number
}

export type AbilityModifiers = Record<AbilityScoreKey, number>

export type ClassHitDie = 'd6' | 'd8' | 'd10' | 'd12'

export interface ClassLevelInput {
  className: string
  hitDie: ClassHitDie
  level: number
}

export interface DerivedStatsInput {
  abilityScores: AbilityScores
  classes: ClassLevelInput[]
  baseArmorClass?: number
}

export interface DerivedStats {
  totalLevel: number
  proficiencyBonus: number
  armorClass: number
  initiative: number
  maxHitPoints: number
  abilityModifiers: AbilityModifiers
}

export const getAbilityModifier = (score: number): number => {
  if (!Number.isFinite(score)) {
    throw new TypeError('Ability score must be a finite number')
  }

  const roundedScore = Math.floor(score)

  return Math.floor((roundedScore - 10) / 2)
}

export const getProficiencyBonus = (totalLevel: number): number => {
  if (totalLevel < 1) {
    throw new RangeError('Total level must be at least 1')
  }

  return Math.ceil(totalLevel / 4) + 1
}

export const calculateAbilityModifiers = (scores: AbilityScores): AbilityModifiers => ({
  str: getAbilityModifier(scores.str),
  dex: getAbilityModifier(scores.dex),
  con: getAbilityModifier(scores.con),
  int: getAbilityModifier(scores.int),
  wis: getAbilityModifier(scores.wis),
  cha: getAbilityModifier(scores.cha),
})

const parseHitDieValue = (hitDie: ClassHitDie): number => {
  const dieValue = Number.parseInt(hitDie.slice(1), 10)

  if (Number.isNaN(dieValue)) {
    throw new Error(`Unable to parse hit die value from ${hitDie}`)
  }

  return dieValue
}

const calculateArmorClassFromModifier = (dexModifier: number, baseArmorClass = 10): number =>
  baseArmorClass + dexModifier

const calculateInitiativeFromModifier = (dexModifier: number): number => dexModifier

const calculateHitPoints = ({ classes, conModifier }: { classes: ClassLevelInput[]; conModifier: number }): number => {
  return classes.reduce((total, characterClass) => {
    const dieValue = parseHitDieValue(characterClass.hitDie)
    const perLevelHp = Math.max(1, dieValue + conModifier)
    return total + perLevelHp * characterClass.level
  }, 0)
}

const calculateTotalLevel = (classes: ClassLevelInput[]): number =>
  classes.reduce((total, characterClass) => total + characterClass.level, 0)

export const calculateDerivedStats = ({
  abilityScores,
  classes,
  baseArmorClass = 10,
}: DerivedStatsInput): DerivedStats => {
  if (!classes.length) {
    throw new RangeError('At least one class is required to calculate derived stats')
  }

  const abilityModifiers = calculateAbilityModifiers(abilityScores)
  const totalLevel = calculateTotalLevel(classes)
  const proficiencyBonus = getProficiencyBonus(totalLevel)
  const armorClass = calculateArmorClassFromModifier(abilityModifiers.dex, baseArmorClass)
  const initiative = calculateInitiativeFromModifier(abilityModifiers.dex)
  const maxHitPoints = calculateHitPoints({ classes, conModifier: abilityModifiers.con })

  return {
    totalLevel,
    proficiencyBonus,
    armorClass,
    initiative,
    maxHitPoints,
    abilityModifiers,
  }
}
