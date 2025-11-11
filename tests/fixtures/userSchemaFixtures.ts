/**
 * User Schema Test Fixtures
 * Centralized test data to reduce test file complexity and improve maintainability
 */

import type { UserProfile, UserPreferences, NotificationSettings } from '@/types/user';

export const validUserProfile: UserProfile = {
  id: 'user-123',
  name: 'Alice Adventurer',
  email: 'alice@example.com',
  createdAt: new Date('2025-10-01T00:00:00Z'),
  updatedAt: new Date('2025-11-11T19:00:00Z'),
};

export const validUserPreferences: UserPreferences = {
  userId: 'user-123',
  experienceLevel: 'Intermediate',
  preferredRole: 'DM',
  ruleset: '5e',
  updatedAt: new Date(),
};

export const validNotifications: NotificationSettings = {
  userId: 'user-123',
  emailNotifications: true,
  partyUpdates: true,
  encounterReminders: true,
  updatedAt: new Date(),
};

export const validEmails = [
  'simple@example.com',
  'user.name+tag@example.co.uk',
  'user_name@example.org',
  'user123@subdomain.example.com',
];

export const invalidEmails = [
  'missing-at-sign.com',
  '@nodomain.com',
  'spaces in@email.com',
  'double@@example.com',
];

export const validNames = [
  'A', // minimum length
  'Alice',
  'Bob the Barbarian',
  '艾莉丝 冒险家', // Unicode
  'A'.repeat(100), // maximum length
];

export const invalidNames = [
  '', // empty
  'A'.repeat(101), // exceeds max
];

export const experienceLevels = ['Novice', 'Intermediate', 'Advanced'];
export const preferredRoles = ['DM', 'Player', 'Both'];
export const rulesets = ['5e', '3.5e', 'PF2e'];
