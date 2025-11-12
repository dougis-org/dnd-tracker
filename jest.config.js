const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@fixtures/(.*)$': '<rootDir>/tests/fixtures/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(bson|mongodb)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],
  testMatch: [
    '<rootDir>/tests/unit/**/*.{spec,test}.{js,jsx,ts,tsx}',
    '<rootDir>/tests/integration/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
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
