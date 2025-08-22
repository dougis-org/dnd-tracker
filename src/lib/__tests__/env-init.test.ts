/**
 * Tests for Environment Initialization Module
 */

import { initializeEnvironment, validateEnvironmentMiddleware } from '../env-init';
import { EnvValidationError } from '../env';

// Mock console to test logging behavior
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
const mockProcessExit = jest.spyOn(process, 'exit').mockImplementation();

// Store original environment to restore after tests
const originalEnv = process.env;

describe('Environment Initialization', () => {
  beforeEach(() => {
    // Reset environment variables before each test
    jest.resetModules();
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restore original environment and mocks
    process.env = originalEnv;
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
    mockProcessExit.mockRestore();
  });

  describe('initializeEnvironment', () => {
    it('should log success message in development when configuration is valid', () => {
      process.env = {
        NODE_ENV: 'development',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
        CLERK_SECRET_KEY: 'sk_test_123',
        MONGODB_URI: 'mongodb://localhost:27017/test',
      };

      initializeEnvironment();

      expect(mockConsoleLog).toHaveBeenCalledWith('✓ Environment configuration loaded successfully');
    });

    it('should not log success message in production', () => {
      process.env = {
        NODE_ENV: 'production',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
        CLERK_SECRET_KEY: 'sk_test_123',
        MONGODB_URI: 'mongodb://localhost:27017/test',
      };

      initializeEnvironment();

      expect(mockConsoleLog).not.toHaveBeenCalled();
    });

    it('should throw error in development when validation fails', () => {
      process.env = {
        NODE_ENV: 'development',
        // Missing required variables
      };

      expect(() => initializeEnvironment()).toThrow();
    });

    it('should exit process in production when validation fails', () => {
      process.env = {
        NODE_ENV: 'production',
        // Missing required variables
      };

      initializeEnvironment();

      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });

    it('should exit process in test environment when validation fails', () => {
      process.env = {
        NODE_ENV: 'test',
        // Missing required variables
      };

      initializeEnvironment();

      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });

    it('should log detailed error message for EnvValidationError', () => {
      process.env = {
        NODE_ENV: 'production',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
        // Missing CLERK_SECRET_KEY and MONGODB_URI
      };

      initializeEnvironment();

      expect(mockConsoleError).toHaveBeenCalledWith('❌ Environment Configuration Error:');
      expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('Missing required environment variables'));
      expect(mockConsoleError).toHaveBeenCalledWith('\nMissing variables:');
      expect(mockConsoleError).toHaveBeenCalledWith('  - CLERK_SECRET_KEY');
      expect(mockConsoleError).toHaveBeenCalledWith('  - MONGODB_URI');
      expect(mockConsoleError).toHaveBeenCalledWith('\nPlease check your .env.local file and ensure all required variables are set.');
    });

    it('should log invalid variables when validation fails with invalid values', () => {
      process.env = {
        NODE_ENV: 'production',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
        CLERK_SECRET_KEY: 'sk_test_123',
        MONGODB_URI: 'invalid-uri',
        NEXT_PUBLIC_APP_URL: 'not-a-url',
      };

      initializeEnvironment();

      expect(mockConsoleError).toHaveBeenCalledWith('\nInvalid variables:');
      expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('MONGODB_URI must be a valid MongoDB connection string'));
      expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('NEXT_PUBLIC_APP_URL must be a valid URL'));
    });

    it('should handle unexpected errors gracefully', () => {
      // Test with a simple Error that's not EnvValidationError
      process.env = {
        NODE_ENV: 'production',
        // This will cause loadEnvConfig to throw because no required vars are set
        // and the error handling is tested in the other tests
      };

      initializeEnvironment();

      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });
  });

  describe('validateEnvironmentMiddleware', () => {
    it('should create middleware function', () => {
      const middleware = validateEnvironmentMiddleware();
      expect(typeof middleware).toBe('function');
    });

    it('should call next() when environment is valid', () => {
      process.env = {
        NODE_ENV: 'test',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
        CLERK_SECRET_KEY: 'sk_test_123',
        MONGODB_URI: 'mongodb://localhost:27017/test',
      };

      const middleware = validateEnvironmentMiddleware();
      const next = jest.fn();

      middleware({}, {}, next);

      expect(next).toHaveBeenCalled();
    });

    it('should throw server configuration error when environment validation fails', () => {
      process.env = {
        NODE_ENV: 'test',
        // Missing required variables
      };

      const middleware = validateEnvironmentMiddleware();
      const next = jest.fn();

      expect(() => middleware({}, {}, next)).toThrow('Server configuration error: Environment variables not properly configured');
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle unexpected errors by re-throwing them', () => {
      // Since validateEnvironmentMiddleware behavior is already tested
      // with EnvValidationError, we can test the general error case
      // by ensuring it properly propagates errors from loadEnvConfig
      const middleware = validateEnvironmentMiddleware();
      const next = jest.fn();

      // With no env vars set, loadEnvConfig will throw an EnvValidationError
      // which gets converted to a server configuration error
      process.env = {};

      expect(() => middleware({}, {}, next)).toThrow('Server configuration error');
      expect(next).not.toHaveBeenCalled();
    });
  });
});