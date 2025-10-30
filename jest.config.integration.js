/* global module, require */
/**
 * Jest configuration for integration tests
 *
 * Integration tests use real MongoDB (via memory server) and test
 * complete workflows through the service layer. These need node environment
 * and special configuration for Mongoose/MongoDB.
 *
 * Run with: npm run test:integration
 */

const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  displayName: 'integration',
  testEnvironment: 'node', // Must use node environment for MongoDB
  testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(bson|mongodb|mongodb-memory-server)/)',
  ],
  transform: {
    '^.+\\.mjs$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/index.{js,jsx,ts,tsx}',
  ],
  coverageReporters: ['text', 'lcov'],
  testTimeout: 30000, // Longer timeout for DB operations
  verbose: true,
};

module.exports = createJestConfig(customJestConfig);
