/**
 * Dashboard API Test Fixtures
 *
 * Shared test data and helpers for dashboard tests
 */

import { SubscriptionTier, TierLimits } from '@/types/subscription'; // eslint-disable-line @typescript-eslint/no-unused-vars

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  'free_adventurer',
  'seasoned_adventurer',
  'expert_dungeon_master',
  'master_of_dungeons',
  'guild_master',
];

export const TIER_TEST_CASES = [
  {
    tier: 'free_adventurer' as SubscriptionTier,
    expectedParties: 1,
    expectedCharacters: 3,
    expectedEncounters: 5,
  },
  {
    tier: 'seasoned_adventurer' as SubscriptionTier,
    expectedParties: 3,
    expectedCharacters: 10,
    expectedEncounters: 20,
  },
  {
    tier: 'expert_dungeon_master' as SubscriptionTier,
    expectedParties: 5,
    expectedCharacters: 20,
    expectedEncounters: 50,
  },
  {
    tier: 'master_of_dungeons' as SubscriptionTier,
    expectedParties: 10,
    expectedCharacters: 50,
    expectedEncounters: 100,
  },
  {
    tier: 'guild_master' as SubscriptionTier,
    expectedParties: Number.POSITIVE_INFINITY,
    expectedCharacters: Number.POSITIVE_INFINITY,
    expectedEncounters: Number.POSITIVE_INFINITY,
  },
];

export const PERCENTAGE_TEST_CASES = [
  { usage: 0, limit: 10, expected: 0 },
  { usage: 5, limit: 10, expected: 50 },
  { usage: 10, limit: 10, expected: 100 },
  { usage: 15, limit: 10, expected: 150 },
  { usage: 1, limit: 3, expected: 33.3 },
];

export const COLOR_STATE_CASES = [
  { percentage: 0, state: 'green' },
  { percentage: 25, state: 'green' },
  { percentage: 79, state: 'green' },
  { percentage: 80, state: 'yellow' },
  { percentage: 99, state: 'yellow' },
  { percentage: 100, state: 'red' },
  { percentage: 150, state: 'red' },
];

export const ERROR_SCENARIOS = [
  { code: 401, name: 'Unauthorized' },
  { code: 404, name: 'NotFound' },
  { code: 500, name: 'ServerError' },
  { code: 429, name: 'RateLimit' },
];

export const CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

export const EMPTY_STATE_CASES = [
  { parties: 0, characters: 0, encounters: 0, isEmpty: true },
  { parties: 1, characters: 0, encounters: 0, isEmpty: false },
  { parties: 0, characters: 1, encounters: 0, isEmpty: false },
  { parties: 0, characters: 0, encounters: 1, isEmpty: false },
];

export const DISPLAY_NAME_CASES = [
  { displayName: 'John Doe', email: 'john@example.com', expected: 'John Doe' },
  { displayName: '', email: 'john@example.com', expected: 'john@example.com' },
  {
    displayName: null as unknown as string,
    email: 'john@example.com',
    expected: 'john@example.com',
  },
];
