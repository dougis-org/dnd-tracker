/**
 * Tests for Environment Configuration Module
 */

import {
  loadEnvConfig,
  getEnvConfig,
  resetEnvConfig,
  EnvValidationError,
  isDevelopment,
  isProduction,
  isTest,
  getDatabaseConfig,
  getClerkConfig,
} from '../env';

// Store original environment to restore after tests
const originalEnv = process.env;

describe('Environment Configuration', () => {
  beforeEach(() => {
    // Reset environment variables before each test
    jest.resetModules();
    process.env = { ...originalEnv };
    resetEnvConfig();
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('loadEnvConfig', () => {
    it('should throw EnvValidationError when required variables are missing', () => {
      // Clear all environment variables
      process.env = {};

      expect(() => loadEnvConfig()).toThrow(EnvValidationError);
    });

    it('should throw EnvValidationError with specific missing variables', () => {
      process.env = {
        NODE_ENV: 'test',
        // Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
        CLERK_SECRET_KEY: 'sk_test_123',
        MONGODB_URI: 'mongodb://localhost:27017/test',
      };

      const error = expect(() => loadEnvConfig()).toThrow(EnvValidationError);
      try {
        loadEnvConfig();
      } catch (e) {
        if (e instanceof EnvValidationError) {
          expect(e.missingVars).toContain('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
        }
      }
    });

    it('should throw EnvValidationError for invalid MongoDB URI', () => {
      process.env = {
        NODE_ENV: 'test',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
        CLERK_SECRET_KEY: 'sk_test_123',
        MONGODB_URI: 'invalid-uri',
      };

      expect(() => loadEnvConfig()).toThrow(EnvValidationError);
    });

    it('should throw EnvValidationError for invalid APP_URL', () => {
      process.env = {
        NODE_ENV: 'test',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
        CLERK_SECRET_KEY: 'sk_test_123',
        MONGODB_URI: 'mongodb://localhost:27017/test',
        NEXT_PUBLIC_APP_URL: 'not-a-url',
      };

      expect(() => loadEnvConfig()).toThrow(EnvValidationError);
    });

    it('should load valid configuration with all required variables', () => {
      process.env = {
        NODE_ENV: 'test',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
        CLERK_SECRET_KEY: 'sk_test_123',
        MONGODB_URI: 'mongodb://localhost:27017/test',
      };

      const config = loadEnvConfig();

      expect(config.NODE_ENV).toBe('test');
      expect(config.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY).toBe('pk_test_123');
      expect(config.CLERK_SECRET_KEY).toBe('sk_test_123');
      expect(config.MONGODB_URI).toBe('mongodb://localhost:27017/test');
    });

    it('should use default values for optional variables', () => {
      process.env = {
        NODE_ENV: 'development',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
        CLERK_SECRET_KEY: 'sk_test_123',
        MONGODB_URI: 'mongodb://localhost:27017/test',
      };

      const config = loadEnvConfig();

      expect(config.NEXT_PUBLIC_APP_URL).toBe('http://localhost:3000');
      expect(config.MONGODB_DB_NAME).toBe('dnd-tracker');
      expect(config.NEXT_PUBLIC_CLERK_SIGN_IN_URL).toBe('/sign-in');
      expect(config.NEXT_PUBLIC_CLERK_SIGN_UP_URL).toBe('/sign-up');
      expect(config.DEPLOYMENT_PLATFORM).toBe('self-hosted');
    });

    it('should apply environment-specific defaults for development', () => {
      process.env = {
        NODE_ENV: 'development',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
        CLERK_SECRET_KEY: 'sk_test_123',
        MONGODB_URI: 'mongodb://localhost:27017/test',
      };

      const config = loadEnvConfig();

      expect(config.DEBUG).toBe(true);
      expect(config.LOG_LEVEL).toBe('debug');
    });

    it('should apply environment-specific defaults for production', () => {
      process.env = {
        NODE_ENV: 'production',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
        CLERK_SECRET_KEY: 'sk_test_123',
        MONGODB_URI: 'mongodb://localhost:27017/test',
      };

      const config = loadEnvConfig();

      expect(config.DEBUG).toBe(false);
      expect(config.LOG_LEVEL).toBe('error');
    });

    it('should apply environment-specific defaults for test', () => {
      process.env = {
        NODE_ENV: 'test',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
        CLERK_SECRET_KEY: 'sk_test_123',
        MONGODB_URI: 'mongodb://localhost:27017/test',
      };

      const config = loadEnvConfig();

      expect(config.DEBUG).toBe(false);
      expect(config.LOG_LEVEL).toBe('warn');
      expect(config.MONGODB_DB_NAME).toBe('dnd-tracker-test');
    });

    it('should accept MongoDB Atlas URI format', () => {
      process.env = {
        NODE_ENV: 'test',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
        CLERK_SECRET_KEY: 'sk_test_123',
        MONGODB_URI: 'mongodb+srv://user:pass@cluster.mongodb.net/db',
      };

      expect(() => loadEnvConfig()).not.toThrow();
    });

    it('should parse boolean values correctly', () => {
      process.env = {
        NODE_ENV: 'test',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
        CLERK_SECRET_KEY: 'sk_test_123',
        MONGODB_URI: 'mongodb://localhost:27017/test',
        DEBUG: 'true',
      };

      const config = loadEnvConfig();
      expect(config.DEBUG).toBe(true);

      process.env.DEBUG = 'false';
      resetEnvConfig();
      const config2 = loadEnvConfig();
      expect(config2.DEBUG).toBe(false);
    });
  });

  describe('getEnvConfig', () => {
    it('should cache configuration and return same instance', () => {
      process.env = {
        NODE_ENV: 'test',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
        CLERK_SECRET_KEY: 'sk_test_123',
        MONGODB_URI: 'mongodb://localhost:27017/test',
      };

      const config1 = getEnvConfig();
      const config2 = getEnvConfig();

      expect(config1).toBe(config2);
    });
  });

  describe('Environment Detection Functions', () => {
    it('should detect development environment', () => {
      process.env = {
        NODE_ENV: 'development',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
        CLERK_SECRET_KEY: 'sk_test_123',
        MONGODB_URI: 'mongodb://localhost:27017/test',
      };

      expect(isDevelopment()).toBe(true);
      expect(isProduction()).toBe(false);
      expect(isTest()).toBe(false);
    });

    it('should detect production environment', () => {
      process.env = {
        NODE_ENV: 'production',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
        CLERK_SECRET_KEY: 'sk_test_123',
        MONGODB_URI: 'mongodb://localhost:27017/test',
      };

      expect(isDevelopment()).toBe(false);
      expect(isProduction()).toBe(true);
      expect(isTest()).toBe(false);
    });

    it('should detect test environment', () => {
      process.env = {
        NODE_ENV: 'test',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
        CLERK_SECRET_KEY: 'sk_test_123',
        MONGODB_URI: 'mongodb://localhost:27017/test',
      };

      expect(isDevelopment()).toBe(false);
      expect(isProduction()).toBe(false);
      expect(isTest()).toBe(true);
    });
  });

  describe('getDatabaseConfig', () => {
    it('should return database configuration', () => {
      process.env = {
        NODE_ENV: 'test',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
        CLERK_SECRET_KEY: 'sk_test_123',
        MONGODB_URI: 'mongodb://localhost:27017/test',
        MONGODB_DB_NAME: 'custom-db',
      };

      const dbConfig = getDatabaseConfig();

      expect(dbConfig.uri).toBe('mongodb://localhost:27017/test');
      expect(dbConfig.dbName).toBe('custom-db');
    });
  });

  describe('getClerkConfig', () => {
    it('should return Clerk configuration', () => {
      process.env = {
        NODE_ENV: 'test',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
        CLERK_SECRET_KEY: 'sk_test_123',
        CLERK_WEBHOOK_SECRET: 'whsec_123',
        MONGODB_URI: 'mongodb://localhost:27017/test',
      };

      const clerkConfig = getClerkConfig();

      expect(clerkConfig.publishableKey).toBe('pk_test_123');
      expect(clerkConfig.secretKey).toBe('sk_test_123');
      expect(clerkConfig.webhookSecret).toBe('whsec_123');
      expect(clerkConfig.signInUrl).toBe('/sign-in');
      expect(clerkConfig.signUpUrl).toBe('/sign-up');
      expect(clerkConfig.afterSignInUrl).toBe('/dashboard');
      expect(clerkConfig.afterSignUpUrl).toBe('/dashboard');
    });
  });

  describe('resetEnvConfig', () => {
    it('should clear cached configuration', () => {
      process.env = {
        NODE_ENV: 'test',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
        CLERK_SECRET_KEY: 'sk_test_123',
        MONGODB_URI: 'mongodb://localhost:27017/test',
      };

      // Get config to cache it
      const config1 = getEnvConfig();

      // Change environment and reset
      process.env.NODE_ENV = 'production';
      resetEnvConfig();

      // Get config again - should reflect new environment
      const config2 = getEnvConfig();

      expect(config1.NODE_ENV).toBe('test');
      expect(config2.NODE_ENV).toBe('production');
    });
  });

  describe('EnvValidationError', () => {
    it('should create error with missing and invalid variables', () => {
      const error = new EnvValidationError(
        'Test error',
        ['MISSING_VAR'],
        ['Invalid VAR_NAME: error message']
      );

      expect(error.message).toBe('Test error');
      expect(error.missingVars).toEqual(['MISSING_VAR']);
      expect(error.invalidVars).toEqual(['Invalid VAR_NAME: error message']);
      expect(error.name).toBe('EnvValidationError');
    });
  });
});