/**
 * User Adapter Mock Factories & Setup Helpers
 *
 * Usage in tests:
 * ```tsx
 * import * as userAdapter from '@/lib/adapters/userAdapter';
 * import {
 *   createMockProfile,
 *   createMockPreferences,
 *   setupUserAdapterMocks,
 *   makeAdapterPending,
 *   makeAdapterSucceed,
 *   makeAdapterFail,
 * } from '@/test-helpers/userAdapterMocks';
 *
 * jest.mock('@/lib/adapters/userAdapter');
 * const mockUserAdapter = userAdapter as jest.Mocked<typeof userAdapter>;
 *
 * describe('MyComponent', () => {
 *   beforeEach(() => {
 *     setupUserAdapterMocks(mockUserAdapter);
 *   });
 *
 *   test('loading state', () => {
 *     makeAdapterPending(mockUserAdapter);
 *     // render and test
 *   });
 * });
 * ```
 */

/**
 * Factory: Create a mock UserProfile with sensible defaults
 */
export const createMockProfile = (overrides?: Record<string, unknown>) => ({
  id: 'user-123',
  name: 'Test User',
  email: 'test@example.com',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-11-01'),
  ...overrides,
});

/**
 * Factory: Create a mock UserPreferences with sensible defaults
 */
export const createMockPreferences = (overrides?: Record<string, unknown>) => ({
  userId: 'user-123',
  experienceLevel: 'Intermediate',
  preferredRole: 'Player',
  ruleset: '5e',
  updatedAt: new Date('2025-11-01'),
  ...overrides,
});

/**
 * Setup: Initialize mock adapter with default jest mocks
 * Call this in beforeEach for unit tests that mock the adapter
 *
 * @param mock - The mocked userAdapter object from jest.mock()
 */
export const setupUserAdapterMocks = (
  mock: Record<string, jest.Mock<unknown>>
) => {
  jest.clearAllMocks();
  // Reset all methods to fn() so they're ready to be configured
  Object.assign(mock, {
    getProfile: jest.fn(),
    getPreferences: jest.fn(),
    updateProfile: jest.fn(),
    updatePreferences: jest.fn(),
  });
};

/**
 * Helper: Make adapter methods never resolve (for testing loading states)
 *
 * @param mock - The mocked userAdapter object
 */
export const makeAdapterPending = (
  mock: Record<string, jest.Mock<unknown>>
) => {
  (mock.getProfile as jest.Mock).mockImplementation(
    () => new Promise(() => {}) // never resolves
  );
  (mock.getPreferences as jest.Mock).mockImplementation(
    () => new Promise(() => {}) // never resolves
  );
  (mock.updateProfile as jest.Mock).mockImplementation(
    () => new Promise(() => {}) // never resolves
  );
  (mock.updatePreferences as jest.Mock).mockImplementation(
    () => new Promise(() => {}) // never resolves
  );
};

/**
 * Helper: Make specific update methods never resolve (for testing disabled state)
 *
 * @param mock - The mocked userAdapter object
 */
export const makeUpdatesPending = (
  mock: Record<string, jest.Mock<unknown>>
) => {
  (mock.updateProfile as jest.Mock).mockImplementationOnce(
    () => new Promise(() => {}) // never resolves
  );
  (mock.updatePreferences as jest.Mock).mockImplementationOnce(
    () => new Promise(() => {}) // never resolves
  );
};

/**
 * Helper: Make adapter resolve with data (successful scenario)
 *
 * @param mock - The mocked userAdapter object
 * @param profile - Optional profile override
 * @param preferences - Optional preferences override
 */
export const makeAdapterSucceed = (
  mock: Record<string, jest.Mock<unknown>>,
  profile?: Record<string, unknown>,
  preferences?: Record<string, unknown>
) => {
  const mockProfile = profile || createMockProfile();
  const mockPreferences = preferences || createMockPreferences();

  (mock.getProfile as jest.Mock).mockResolvedValue(mockProfile);
  (mock.getPreferences as jest.Mock).mockResolvedValue(mockPreferences);
  (mock.updateProfile as jest.Mock).mockResolvedValue(mockProfile);
  (mock.updatePreferences as jest.Mock).mockResolvedValue(mockPreferences);
};

/**
 * Helper: Make adapter reject (error scenario)
 *
 * @param mock - The mocked userAdapter object
 * @param error - Optional custom error, defaults to generic "operation failed"
 */
export const makeAdapterFail = (
  mock: Record<string, jest.Mock<unknown>>,
  error?: Error
) => {
  const testError = error || new Error('Adapter operation failed');
  (mock.getProfile as jest.Mock).mockRejectedValue(testError);
  (mock.getPreferences as jest.Mock).mockRejectedValue(testError);
  (mock.updateProfile as jest.Mock).mockRejectedValue(testError);
  (mock.updatePreferences as jest.Mock).mockRejectedValue(testError);
};
