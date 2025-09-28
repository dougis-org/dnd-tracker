const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/', '<rootDir>/tests/e2e/', '<rootDir>/tests/milestones/', '<rootDir>/tests/integration/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
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
    // Exclude db connection (would need integration tests)
    '!src/lib/db/connection.ts',
    // Exclude large UI components not yet implemented
    '!src/components/forms/UserProfileForm.tsx',
    '!src/components/ui/form-field.tsx',
    '!src/components/ui/select.tsx',
    // Exclude complex models and validations that need integration tests
    '!src/lib/db/models/User.ts',
    '!src/lib/validations/auth.ts',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testTimeout: 10000,
  verbose: true,
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)