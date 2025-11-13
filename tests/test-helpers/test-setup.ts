/**
 * Common test setup utilities to reduce duplication across test files
 */

/**
 * Setup fake timers with standard configuration
 * Used for debounced input tests
 */
export function setupFakeTimers(): void {
  jest.useFakeTimers()
}

/**
 * Teardown fake timers and clear all mocks
 * Standard cleanup after timer tests
 */
export function teardownFakeTimers(): void {
  jest.clearAllTimers()
  jest.useRealTimers()
  jest.clearAllMocks()
}

/**
 * Create userEvent setup options with fake timer advancement
 */
export function getUserEventSetupWithTimers() {
  return { advanceTimers: (ms: number) => jest.advanceTimersByTime(ms) }
}
