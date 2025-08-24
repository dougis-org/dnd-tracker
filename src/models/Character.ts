// Re-export the comprehensive D&D 5e character interface from schemas
export { ICharacter as Character } from './schemas';

// Legacy interface for backward compatibility
export interface BasicCharacter {
  id: string
  name: string
  level: number
  hitPoints: number
  armorClass: number
}