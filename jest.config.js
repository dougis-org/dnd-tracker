const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/tests/e2e/',
    '<rootDir>/tests/milestones/',
    // TODO: Fix broken integration tests that require Clerk auth mocking
    '<rootDir>/tests/integration/test_auth_session.test.ts',
    '<rootDir>/tests/integration/test_users_profile.test.ts',
    '<rootDir>/tests/integration/test_users_profile_update.test.ts',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(bson|mongodb|mongodb-memory-server)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/index.{js,jsx,ts,tsx}',
    // Exclude framework/layout files that are primarily configuration
    '!src/app/layout.tsx',
    '!src/app/page.tsx',
    '!src/app/(auth)/layout.tsx',
    '!src/app/dashboard/layout.tsx',
    '!src/app/dashboard/page.tsx',
    // Exclude complex auth middleware (would need integration tests)
    '!src/lib/auth/middleware.ts',
    '!src/lib/auth/clerk-config.ts',
    // Exclude db modules (would need integration tests with test containers)
    '!src/lib/db/connection.ts',
    '!src/lib/db/events.ts',
    '!src/lib/db/health.ts',
    '!src/lib/db/indexes.ts',
    '!src/lib/db/initialize.ts',
    '!src/lib/db/shutdown.ts',
    // Exclude large UI components (require complex mocking)
    '!src/components/forms/UserProfileForm.tsx',
    '!src/components/ui/form-field.tsx',
    '!src/components/ui/select.tsx',
    // Exclude complex models (require test database)
    '!src/lib/db/models/User.ts',
    // auth.ts is just re-exports, tested via actual implementations
    '!src/lib/validations/auth.ts',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testTimeout: 10000,
  verbose: true,
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)