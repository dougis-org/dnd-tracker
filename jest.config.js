const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  // Run the Node pre-test mocks before any modules import mongoose/bson
  setupFiles: ['<rootDir>/jest.setup-node-mocks.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Default to jsdom for DOM tests and @testing-library/user-event
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@fixtures/(.*)$': '<rootDir>/tests/fixtures/$1',
    '^@test-helpers/(.*)$': '<rootDir>/tests/test-helpers/$1',
  },
  // Allow transforming ESM modules in node_modules (bson, mongodb, mongoose)
  // Use a more permissive pattern that matches nested node_modules paths
  // e.g. node_modules/mongodb/node_modules/bson
  transformIgnorePatterns: ['node_modules/(?!(mongodb|bson|mongoose)/)'],

  // Ensure .mjs modules in node_modules (e.g., bson) are transformed by babel-jest
  // Use babel-jest to transform JS/TS/MJS files (including ESM in node_modules)
  transform: {
    '^.+\\.(js|jsx|ts|tsx|mjs)$': 'babel-jest',
  },
  // No explicit extensionsToTreatAsEsm necessary; Jest treats .mjs as ESM by default
  // However, Next.js may set it, so we explicitly set to empty to avoid jest validation error
  extensionsToTreatAsEsm: [],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],
  // Run unit tests only under the default jest config. Integration tests
  // should be executed using `jest.integration.config.js` which uses a
  // node environment and real database connections.
  testMatch: ['<rootDir>/tests/unit/**/*.{spec,test}.{js,jsx,ts,tsx}'],
  testPathIgnorePatterns: [
    '<rootDir>/tests/e2e/',
    '<rootDir>/tests/unit/encounter/encounter.model.test.ts',
    '<rootDir>/tests/unit/encounter/encounter.schema.test.ts',
    '<rootDir>/tests/unit/encounter/encounters.api.test.ts',
    '<rootDir>/tests/integration/encounter-mongo.test.ts',
    '<rootDir>/tests/integration/api/encounters.route.test.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 40,
      lines: 50,
      statements: 50,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
