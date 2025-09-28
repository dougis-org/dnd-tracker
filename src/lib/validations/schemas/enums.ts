/**
 * Common enum schemas used across the application
 * Extracted from auth.ts to reduce complexity
 */
import { z } from 'zod'

// Core D&D and user enums
export const DndRulesetSchema = z.enum(['5e', '3.5e', 'pf1', 'pf2'])
export const ExperienceLevelSchema = z.enum(['beginner', 'intermediate', 'expert'])
export const UserRoleSchema = z.enum(['player', 'dm', 'both'])

// UI and preference enums
export const ThemeSchema = z.enum(['light', 'dark', 'auto'])
export const InitiativeTypeSchema = z.enum(['manual', 'auto'])

// Subscription related enums
export const SubscriptionTierSchema = z.enum(['free', 'seasoned', 'expert', 'master', 'guild'])
export const SubscriptionStatusSchema = z.enum(['active', 'cancelled', 'trial'])

// Type exports for TypeScript
export type DndRuleset = z.infer<typeof DndRulesetSchema>
export type ExperienceLevel = z.infer<typeof ExperienceLevelSchema>
export type UserRole = z.infer<typeof UserRoleSchema>
export type Theme = z.infer<typeof ThemeSchema>
export type InitiativeType = z.infer<typeof InitiativeTypeSchema>
export type SubscriptionTier = z.infer<typeof SubscriptionTierSchema>
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>