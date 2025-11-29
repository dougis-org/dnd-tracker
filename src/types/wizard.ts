/**
 * Profile Setup Wizard - TypeScript Type Definitions
 *
 * Centralized types for wizard state, form data, API payloads, and component props.
 * Ensures type safety across all wizard-related code.
 */

/**
 * Theme preference for user interface
 */
export type Theme = 'light' | 'dark';

/**
 * User preferences collected during wizard setup
 */
export interface UserPreferences {
  /** UI theme preference */
  theme: Theme;
  
  /** Whether to receive notifications */
  notifications: boolean;
}

/**
 * Profile data collected during wizard setup
 */
export interface ProfileSetup {
  /** User's display name (1-50 characters) */
  displayName: string;
  
  /** Avatar image (base64 encoded, optional, ≤250KB) */
  avatar?: string;
  
  /** User preferences (theme, notifications) */
  preferences: UserPreferences;
  
  /** Whether setup is marked as complete */
  completedSetup: boolean;
}

/**
 * User profile as returned from the API
 */
export interface UserProfile {
  /** Unique user identifier */
  userId: string;
  
  /** User email address */
  email: string;
  
  /** Display name */
  displayName: string;
  
  /** Full profile object */
  profile: {
    displayName: string;
    avatar?: string;
    preferences: UserPreferences;
    completedSetup: boolean;
    setupCompletedAt?: string;
  };
  
  /** Timestamp when user was created */
  createdAt: string;
  
  /** Timestamp of last update */
  updatedAt: string;
}

/**
 * API payload for updating user profile
 */
export interface ProfileUpdatePayload {
  profile: Partial<ProfileSetup>;
}

/**
 * API response when updating user profile
 */
export interface ProfileUpdateResponse {
  userId: string;
  email: string;
  displayName: string;
  profile: {
    displayName: string;
    avatar?: string;
    preferences: UserPreferences;
    completedSetup: boolean;
    setupCompletedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Wizard screen type (one of the 5 screens in the flow)
 */
export type WizardScreen = 
  | 'welcome'
  | 'displayName'
  | 'avatarUpload'
  | 'preferences'
  | 'completion';

/**
 * Current state of the wizard form
 */
export interface WizardFormState {
  /** Display name input value */
  displayName: string;
  
  /** Avatar base64 string (after compression) */
  avatar?: string;
  
  /** Original avatar preview URL (for preview before compression) */
  avatarPreview?: string;
  
  /** Theme preference selection */
  theme: Theme;
  
  /** Notifications preference toggle */
  notifications: boolean;
}

/**
 * Validation state for wizard form fields
 */
export interface WizardValidationState {
  /** Display name field validity */
  displayName: {
    isValid: boolean;
    error?: string;
  };
  
  /** Avatar field validity */
  avatar: {
    isValid: boolean;
    error?: string;
    isCompressing?: boolean;
  };
  
  /** Preferences field validity */
  preferences: {
    isValid: boolean;
    error?: string;
  };
}

/**
 * State management for the wizard modal
 */
export interface WizardModalState {
  /** Whether modal is open/visible */
  isOpen: boolean;
  
  /** Current screen displayed */
  currentScreen: WizardScreen;
  
  /** Form data */
  formState: WizardFormState;
  
  /** Field validation states */
  validationState: WizardValidationState;
  
  /** Whether form is currently submitting */
  isSubmitting: boolean;
  
  /** Whether user can dismiss modal (false on first login) */
  canDismiss: boolean;
  
  /** Error message from last submission attempt */
  submissionError?: string;
  
  /** Retry attempt counter */
  retryCount: number;
}

/**
 * Return type for useProfileSetupWizard hook
 */
export interface UseProfileSetupWizardReturn {
  /** Current wizard state */
  state: WizardModalState;
  
  /** Close the wizard modal */
  closeWizard: () => void;
  
  /** Open the wizard modal */
  openWizard: () => void;
  
  /** Move to next screen */
  nextScreen: () => void;
  
  /** Move to previous screen */
  previousScreen: () => void;
  
  /** Move to specific screen */
  goToScreen: (screen: WizardScreen) => void;
  
  /** Update display name field */
  setDisplayName: (name: string) => void;
  
  /** Update avatar field */
  setAvatar: (avatar: string | undefined) => void;
  
  /** Update avatar preview */
  setAvatarPreview: (preview: string | undefined) => void;
  
  /** Update theme preference */
  setTheme: (theme: Theme) => void;
  
  /** Update notifications preference */
  setNotifications: (enabled: boolean) => void;
  
  /** Submit wizard form to API */
  submitWizard: () => Promise<void>;
  
  /** Clear form validation errors */
  clearValidationErrors: () => void;
  
  /** Reset wizard to initial state */
  resetWizard: () => void;
}

/**
 * Props for ProfileSetupWizardModal component
 */
export interface ProfileSetupWizardModalProps {
  /** Whether modal should be displayed */
  isOpen: boolean;
  
  /** Callback when modal is closed */
  onClose: () => void;
  
  /** Callback when wizard is successfully completed */
  onComplete?: (profile: ProfileSetup) => void;
  
  /** Whether user can dismiss modal (false on first login) */
  canDismiss?: boolean;
  
  /** User ID for API calls */
  userId?: string;
}

/**
 * Props for individual wizard screen components
 */
export interface WizardScreenProps {
  /** Current form state */
  formState: WizardFormState;
  
  /** Current validation state */
  validationState: WizardValidationState;
  
  /** Whether to show validation errors */
  showErrors?: boolean;
  
  /** Callback when user wants to proceed */
  onNext: () => void;
  
  /** Callback when user wants to go back */
  onPrevious?: () => void;
  
  /** Whether the next button should be disabled */
  isNextDisabled?: boolean;
  
  /** Whether the form is submitting */
  isSubmitting?: boolean;
}

/**
 * Props for WelcomeScreen component
 */
export interface WelcomeScreenProps extends Omit<WizardScreenProps, 'formState' | 'validationState'> {
  /** No additional props needed for welcome screen */
}

/**
 * Props for DisplayNameScreen component
 */
export interface DisplayNameScreenProps extends WizardScreenProps {
  /** Callback when display name changes */
  onDisplayNameChange: (name: string) => void;
}

/**
 * Props for AvatarUploadScreen component
 */
export interface AvatarUploadScreenProps extends WizardScreenProps {
  /** Callback when avatar is selected */
  onAvatarChange: (avatar: string | undefined) => void;
  
  /** Callback to update avatar preview */
  onAvatarPreviewChange: (preview: string | undefined) => void;
  
  /** Whether avatar is currently being compressed */
  isCompressing?: boolean;
}

/**
 * Props for PreferencesScreen component
 */
export interface PreferencesScreenProps extends WizardScreenProps {
  /** Callback when theme changes */
  onThemeChange: (theme: Theme) => void;
  
  /** Callback when notifications preference changes */
  onNotificationsChange: (enabled: boolean) => void;
}

/**
 * Props for CompletionScreen component
 */
export interface CompletionScreenProps extends Omit<WizardScreenProps, 'formState' | 'validationState'> {
  /** User's display name to show in completion message */
  displayName: string;
}

/**
 * Props for ProfileSetupReminder component
 */
export interface ProfileSetupReminderProps {
  /** Whether reminder should be displayed */
  isVisible: boolean;
  
  /** Callback when user clicks to complete setup */
  onStartWizard: () => void;
  
  /** Callback when user dismisses reminder */
  onDismiss?: () => void;
  
  /** Whether reminder can be dismissed */
  canDismiss?: boolean;
}

/**
 * Avatar compression result
 */
export interface AvatarCompressionResult {
  /** Compressed avatar as base64 string */
  compressed: string;
  
  /** Size of compressed avatar in bytes */
  sizeBytes: number;
  
  /** Size of compressed avatar in KB */
  sizeKB: number;
  
  /** MIME type of compressed image */
  mimeType: string;
  
  /** Original file size in bytes */
  originalSizeBytes: number;
  
  /** Compression ratio (original / compressed) */
  compressionRatio: number;
}

/**
 * Avatar validation result
 */
export interface AvatarValidationResult {
  /** Whether avatar is valid */
  isValid: boolean;
  
  /** Error message if invalid */
  error?: string;
  
  /** Detected MIME type */
  mimeType?: string;
  
  /** File size in bytes */
  sizeBytes?: number;
}

/**
 * Error response from API
 */
export interface ApiErrorResponse {
  /** Error code/identifier */
  error: string;
  
  /** Human-readable error message */
  message: string;
  
  /** HTTP status code */
  statusCode: number;
  
  /** Additional context or details */
  context?: Record<string, unknown>;
}
