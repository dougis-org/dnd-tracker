import type {
  UserProfile,
  UserPreferences,
  NotificationSettings,
} from '@/lib/schemas/userSchema';

// Re-export schemas' types for convenience
export type { UserProfile, UserPreferences, NotificationSettings };

// Combine all user settings into a single interface for page-level data
export interface UserSettings {
  profile: UserProfile;
  preferences: UserPreferences;
  notifications: NotificationSettings;
}

// API response wrapper for success/error cases
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: Record<string, string[]>;
  };
}

// Form state tracking
export interface FormState<T> {
  data: T;
  isDirty: boolean;
  isSaving: boolean;
  error: string | null;
}
