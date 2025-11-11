import {
  userProfileSchema,
  userPreferencesSchema,
  notificationSettingsSchema,
} from '@/lib/schemas/userSchema';
import type { UserProfile, UserPreferences, NotificationSettings } from '@/types/user';

/* eslint-disable no-undef */
// localStorage and setTimeout are globals available in browser environment

/**
 * Mock User Data Adapter
 * Provides localStorage-backed CRUD operations for user profile, preferences, and notifications
 * Simulates realistic network delays and validation errors
 *
 * In F014 (MongoDB integration), this will be replaced with real API calls
 * Pattern: This adapter is swappable, allowing easy migration to real backend
 */

const NETWORK_DELAY_MS = 300; // Simulate network latency

/**
 * Generate default user profile
 */
function createDefaultProfile(userId: string): UserProfile {
  return {
    id: userId,
    name: `User ${userId}`,
    email: `user-${userId}@example.com`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Generate default preferences
 */
function createDefaultPreferences(userId: string): UserPreferences {
  return {
    userId,
    experienceLevel: 'Novice',
    preferredRole: 'Both',
    ruleset: '5e',
    updatedAt: new Date(),
  };
}

/**
 * Generate default notification settings
 */
function createDefaultNotifications(userId: string): NotificationSettings {
  return {
    userId,
    emailNotifications: true,
    partyUpdates: true,
    encounterReminders: true,
    updatedAt: new Date(),
  };
}

/**
 * Simulate network delay
 */
function delay(ms: number = NETWORK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get profile from localStorage or return default
 */
function getProfileFromStorage(userId: string): UserProfile {
  const key = `user:profile:${userId}`;
  const stored = localStorage.getItem(key);

  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      console.error(`Failed to parse profile from storage for user ${userId}`);
    }
  }

  return createDefaultProfile(userId);
}

/**
 * Get preferences from localStorage or return default
 */
function getPreferencesFromStorage(userId: string): UserPreferences {
  const key = `user:preferences:${userId}`;
  const stored = localStorage.getItem(key);

  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      console.error(`Failed to parse preferences from storage for user ${userId}`);
    }
  }

  return createDefaultPreferences(userId);
}

/**
 * Get notifications from localStorage or return default
 */
function getNotificationsFromStorage(userId: string): NotificationSettings {
  const key = `user:notifications:${userId}`;
  const stored = localStorage.getItem(key);

  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      console.error(`Failed to parse notifications from storage for user ${userId}`);
    }
  }

  return createDefaultNotifications(userId);
}

/**
 * Save profile to localStorage
 */
function saveProfileToStorage(profile: UserProfile): void {
  const key = `user:profile:${profile.id}`;
  localStorage.setItem(key, JSON.stringify(profile));
}

/**
 * Save preferences to localStorage
 */
function savePreferencesToStorage(preferences: UserPreferences): void {
  const key = `user:preferences:${preferences.userId}`;
  localStorage.setItem(key, JSON.stringify(preferences));
}

/**
 * Save notifications to localStorage
 */
function saveNotificationsToStorage(notifications: NotificationSettings): void {
  const key = `user:notifications:${notifications.userId}`;
  localStorage.setItem(key, JSON.stringify(notifications));
}

/**
 * Public User Adapter API
 */
export const userAdapter = {
  /**
   * Get user profile
   * Returns profile from localStorage or default
   */
  async getProfile(userId: string): Promise<UserProfile> {
    await delay();

    const profile = getProfileFromStorage(userId);
    // Validate against schema to ensure integrity
    const validated = userProfileSchema.safeParse(profile);

    if (!validated.success) {
      throw new Error('Invalid profile data in storage');
    }

    return validated.data;
  },

  /**
   * Update user profile with partial data
   * Validates before saving, throws on validation error
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    await delay();

    // Get current profile
    const current = getProfileFromStorage(userId);

    // Merge updates
    const merged = {
      ...current,
      ...updates,
      id: current.id, // Don't allow id to be changed
      createdAt: current.createdAt, // Don't allow creation date to be changed
      updatedAt: new Date(), // Always update timestamp
    };

    // Validate merged data
    const validated = userProfileSchema.safeParse(merged);
    if (!validated.success) {
      throw new Error(
        `Profile validation failed: ${validated.error.issues.map((i) => i.message).join(', ')}`
      );
    }

    // Save to storage
    saveProfileToStorage(validated.data);

    return validated.data;
  },

  /**
   * Get user preferences
   */
  async getPreferences(userId: string): Promise<UserPreferences> {
    await delay();

    const preferences = getPreferencesFromStorage(userId);
    const validated = userPreferencesSchema.safeParse(preferences);

    if (!validated.success) {
      throw new Error('Invalid preferences data in storage');
    }

    return validated.data;
  },

  /**
   * Update user preferences with partial data
   */
  async updatePreferences(userId: string, updates: Partial<UserPreferences>): Promise<UserPreferences> {
    await delay();

    const current = getPreferencesFromStorage(userId);

    const merged = {
      ...current,
      ...updates,
      userId: current.userId, // Don't allow userId to change
      updatedAt: new Date(),
    };

    const validated = userPreferencesSchema.safeParse(merged);
    if (!validated.success) {
      throw new Error(
        `Preferences validation failed: ${validated.error.issues.map((i) => i.message).join(', ')}`
      );
    }

    savePreferencesToStorage(validated.data);

    return validated.data;
  },

  /**
   * Get notification settings
   */
  async getNotifications(userId: string): Promise<NotificationSettings> {
    await delay();

    const notifications = getNotificationsFromStorage(userId);
    const validated = notificationSettingsSchema.safeParse(notifications);

    if (!validated.success) {
      throw new Error('Invalid notification settings in storage');
    }

    return validated.data;
  },

  /**
   * Update notification settings with partial data
   */
  async updateNotifications(
    userId: string,
    updates: Partial<NotificationSettings>
  ): Promise<NotificationSettings> {
    await delay();

    const current = getNotificationsFromStorage(userId);

    const merged = {
      ...current,
      ...updates,
      userId: current.userId, // Don't allow userId to change
      updatedAt: new Date(),
    };

    const validated = notificationSettingsSchema.safeParse(merged);
    if (!validated.success) {
      throw new Error(
        `Notifications validation failed: ${validated.error.issues.map((i) => i.message).join(', ')}`
      );
    }

    saveNotificationsToStorage(validated.data);

    return validated.data;
  },
};
