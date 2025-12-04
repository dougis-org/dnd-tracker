/**
 * Profile Setup Wizard - Configuration Constants
 *
 * Centralized constants for wizard validation, sizing, and UI configuration.
 * Used across all wizard components to ensure consistency.
 */

/** Avatar file size constraints */
export const AVATAR_CONSTRAINTS = {
  /** Maximum avatar file size in bytes (client-side) */
  MAX_FILE_SIZE_BYTES: 2 * 1024 * 1024, // 2MB

  /** Maximum compressed base64 size in bytes (for API payload) */
  MAX_BASE64_SIZE_BYTES: 250 * 1024, // 250KB

  /** Maximum compressed base64 size as string (for calculations) */
  MAX_BASE64_SIZE_KB: 250,

  /** Target compressed size before API submission */
  TARGET_COMPRESSED_SIZE_KB: 100,

  /** Allowed image MIME types */
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'],

  /** Allowed image file extensions */
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
};

/** Display name validation constraints */
export const DISPLAY_NAME_CONSTRAINTS = {
  /** Minimum display name length (after trim) */
  MIN_LENGTH: 1,

  /** Maximum display name length */
  MAX_LENGTH: 50,
};

/** Preferences validation constraints */
export const PREFERENCES_CONSTRAINTS = {
  /** Allowed theme values */
  ALLOWED_THEMES: ['light', 'dark'] as const,

  /** Default theme preference */
  DEFAULT_THEME: 'light' as const,

  /** Default notifications preference */
  DEFAULT_NOTIFICATIONS: true,
};

/** API request/response constraints */
export const API_CONSTRAINTS = {
  /** Maximum total payload size in bytes */
  MAX_PAYLOAD_SIZE_BYTES: 1024 * 1024, // 1MB

  /** Request timeout in milliseconds */
  TIMEOUT_MS: 10000, // 10 seconds

  /** Maximum retry attempts */
  MAX_RETRIES: 3,

  /** Retry delay in milliseconds */
  RETRY_DELAY_MS: 1000,
};

/** Avatar compression settings */
export const AVATAR_COMPRESSION = {
  /** Initial JPEG quality setting (0-1) */
  INITIAL_QUALITY: 0.9,

  /** Minimum JPEG quality setting */
  MIN_QUALITY: 0.3,

  /** Quality decrement per iteration */
  QUALITY_STEP: 0.1,

  /** Compression timeout in milliseconds */
  TIMEOUT_MS: 2000,
};

/** Wizard screen configuration */
export const WIZARD_SCREENS = {
  WELCOME: 'welcome',
  DISPLAY_NAME: 'displayName',
  AVATAR_UPLOAD: 'avatarUpload',
  PREFERENCES: 'preferences',
  COMPLETION: 'completion',
} as const;

/** Wizard screen order (used for navigation) */
export const WIZARD_SCREEN_ORDER = [
  WIZARD_SCREENS.WELCOME,
  WIZARD_SCREENS.DISPLAY_NAME,
  WIZARD_SCREENS.AVATAR_UPLOAD,
  WIZARD_SCREENS.PREFERENCES,
  WIZARD_SCREENS.COMPLETION,
] as const;

/** Error message templates */
export const ERROR_MESSAGES = {
  DISPLAY_NAME_REQUIRED: 'Display name is required',
  DISPLAY_NAME_TOO_SHORT: 'Display name must be at least 1 character',
  DISPLAY_NAME_TOO_LONG: `Display name must be ${DISPLAY_NAME_CONSTRAINTS.MAX_LENGTH} characters or less`,

  AVATAR_INVALID_FORMAT: 'Invalid image format. Please use JPEG, PNG, or WebP',
  AVATAR_TOO_LARGE: `Avatar file size must be ${AVATAR_CONSTRAINTS.MAX_FILE_SIZE_BYTES / 1024 / 1024}MB or less`,
  AVATAR_COMPRESSED_TOO_LARGE: `Compressed avatar exceeds ${AVATAR_CONSTRAINTS.MAX_BASE64_SIZE_KB}KB. Please use a smaller image`,
  AVATAR_COMPRESSION_FAILED:
    'Failed to compress avatar. Please try a different image',
  AVATAR_COMPRESSION_TIMEOUT:
    'Avatar compression took too long. Please try a smaller image',

  THEME_REQUIRED: 'Theme preference is required',
  THEME_INVALID: 'Invalid theme preference',

  NOTIFICATIONS_INVALID: 'Invalid notifications preference',

  SUBMISSION_FAILED: 'Failed to save your profile. Please try again',
  SUBMISSION_TIMEOUT: 'Profile save took too long. Please try again',
  NETWORK_ERROR: 'Network error. Please check your connection and try again',
} as const;

/** Success message templates */
export const SUCCESS_MESSAGES = {
  PROFILE_SAVED: 'Your profile has been saved successfully!',
  WIZARD_COMPLETE: 'Welcome! Your profile setup is complete.',
} as const;

/** Toast notification configuration */
export const TOAST_CONFIG = {
  /** Toast display duration in milliseconds */
  DURATION_MS: 4000,

  /** Toast position on screen */
  POSITION: 'bottom-right' as const,
};

/** Accessibility configuration */
export const A11Y_CONFIG = {
  /** Focus trap enabled for modal */
  FOCUS_TRAP_ENABLED: true,

  /** Escape key closes modal (on subsequent visits only) */
  ESCAPE_KEY_CLOSES: true,

  /** Modal role for screen readers */
  MODAL_ROLE: 'dialog' as const,
};

/** Local storage keys for wizard state persistence */
export const STORAGE_KEYS = {
  /** Dismissed reminder count */
  REMINDER_DISMISSED_COUNT: 'wizard:reminder:dismissed',

  /** Last wizard dismissal timestamp */
  REMINDER_LAST_DISMISSED: 'wizard:reminder:lastDismissed',

  /** Draft wizard data (not submitted) */
  WIZARD_DRAFT: 'wizard:draft',
};
