const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  // Load a small env setup script to mark this run as integration. This causes
  // `jest.setup.js` to skip database mocks so real mongoose/bson are used.
  setupFiles: ['<rootDir>/jest.integration.env.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@fixtures/(.*)$': '<rootDir>/tests/fixtures/$1',
    '^@test-helpers/(.*)$': '<rootDir>/tests/test-helpers/$1',
  },
  transformIgnorePatterns: ['node_modules/(?!(mongodb|bson|mongoose)/)'],
  extensionsToTreatAsEsm: ['.mjs'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx|mjs)$': 'babel-jest',
  },
  testMatch: ['<rootDir>/tests/integration/**/*.{spec,test}.{js,jsx,ts,tsx}'],
};

module.exports = createJestConfig(customJestConfig);
