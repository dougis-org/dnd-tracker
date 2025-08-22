/**
 * Environment Configuration Module
 * 
 * This module handles environment variable validation and configuration
 * for different deployment environments (development, staging, production).
 */

/**
 * Environment types supported by the application
 */
export type Environment = 'development' | 'production' | 'test';

/**
 * Configuration schema for required environment variables
 */
export interface EnvConfig {
  // Application Environment
  NODE_ENV: Environment;
  NEXT_PUBLIC_APP_URL: string;
  
  // Clerk Authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;
  CLERK_WEBHOOK_SECRET?: string;
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: string;
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: string;
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: string;
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: string;
  
  // Database
  MONGODB_URI: string;
  MONGODB_DB_NAME: string;
  
  // Deployment & Hosting
  DEPLOYMENT_PLATFORM: string;
  PORT?: string;
  HOSTNAME?: string;
  
  // Development & Debugging
  DEBUG: boolean;
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug';
  
  // Environment Validation
  ENV_CONFIG_VERSION: string;
}

/**
 * Default environment configuration values
 */
const DEFAULT_CONFIG: Partial<EnvConfig> = {
  NODE_ENV: 'development',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: '/sign-in',
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: '/sign-up',
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: '/dashboard',
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: '/dashboard',
  MONGODB_DB_NAME: 'dnd-tracker',
  DEPLOYMENT_PLATFORM: 'self-hosted',
  PORT: '3000',
  HOSTNAME: '0.0.0.0',
  DEBUG: false,
  LOG_LEVEL: 'info',
  ENV_CONFIG_VERSION: '1.0.0',
};

/**
 * Required environment variables that must be set
 */
const REQUIRED_VARS = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'MONGODB_URI',
] as const;

/**
 * Environment-specific configurations
 */
const ENV_SPECIFIC_DEFAULTS: Record<Environment, Partial<EnvConfig>> = {
  development: {
    DEBUG: true,
    LOG_LEVEL: 'debug',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  },
  production: {
    DEBUG: false,
    LOG_LEVEL: 'error',
  },
  test: {
    DEBUG: false,
    LOG_LEVEL: 'warn',
    MONGODB_DB_NAME: 'dnd-tracker-test',
  },
};

/**
 * Validation error class for environment configuration
 */
export class EnvValidationError extends Error {
  constructor(
    message: string,
    public readonly missingVars: string[] = [],
    public readonly invalidVars: string[] = []
  ) {
    super(message);
    this.name = 'EnvValidationError';
  }
}

/**
 * Parse boolean value from environment variable
 */
function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

/**
 * Validate environment variable value
 */
function validateEnvVar(key: string, value: string | undefined): string | null {
  if (!value || value.trim() === '') {
    return `${key} is required but not set`;
  }
  
  // URL validation for app URL
  if (key === 'NEXT_PUBLIC_APP_URL') {
    try {
      new URL(value);
    } catch {
      return `${key} must be a valid URL`;
    }
  }
  
  // MongoDB URI validation
  if (key === 'MONGODB_URI') {
    if (!value.startsWith('mongodb://') && !value.startsWith('mongodb+srv://')) {
      return `${key} must be a valid MongoDB connection string`;
    }
  }
  
  return null;
}

/**
 * Validate and load environment configuration
 */
export function loadEnvConfig(): EnvConfig {
  const nodeEnv = (process.env.NODE_ENV || 'development') as Environment;
  const envDefaults = ENV_SPECIFIC_DEFAULTS[nodeEnv] || {};
  
  // Combine defaults with environment-specific defaults
  const combinedDefaults = { ...DEFAULT_CONFIG, ...envDefaults };
  
  const missingVars: string[] = [];
  const invalidVars: string[] = [];
  
  // Check required variables
  for (const varName of REQUIRED_VARS) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      missingVars.push(varName);
    } else {
      const error = validateEnvVar(varName, value);
      if (error) {
        invalidVars.push(error);
      }
    }
  }
  
  // Validate optional but important variables if they're set
  const optionalVars = ['NEXT_PUBLIC_APP_URL', 'MONGODB_URI'];
  for (const varName of optionalVars) {
    const value = process.env[varName];
    if (value) {
      const error = validateEnvVar(varName, value);
      if (error) {
        invalidVars.push(error);
      }
    }
  }
  
  if (missingVars.length > 0 || invalidVars.length > 0) {
    const message = [
      missingVars.length > 0 ? `Missing required environment variables: ${missingVars.join(', ')}` : '',
      invalidVars.length > 0 ? `Invalid environment variables: ${invalidVars.join('; ')}` : '',
    ].filter(Boolean).join('. ');
    
    throw new EnvValidationError(message, missingVars, invalidVars);
  }
  
  // Build configuration object
  const config: EnvConfig = {
    NODE_ENV: nodeEnv,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || combinedDefaults.NEXT_PUBLIC_APP_URL!,
    
    // Clerk Authentication
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY!,
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || combinedDefaults.NEXT_PUBLIC_CLERK_SIGN_IN_URL!,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || combinedDefaults.NEXT_PUBLIC_CLERK_SIGN_UP_URL!,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || combinedDefaults.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL!,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || combinedDefaults.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL!,
    
    // Database
    MONGODB_URI: process.env.MONGODB_URI!,
    MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || combinedDefaults.MONGODB_DB_NAME!,
    
    // Deployment & Hosting
    DEPLOYMENT_PLATFORM: process.env.DEPLOYMENT_PLATFORM || combinedDefaults.DEPLOYMENT_PLATFORM!,
    PORT: process.env.PORT || combinedDefaults.PORT,
    HOSTNAME: process.env.HOSTNAME || combinedDefaults.HOSTNAME,
    
    // Development & Debugging
    DEBUG: parseBoolean(process.env.DEBUG, combinedDefaults.DEBUG!),
    LOG_LEVEL: (process.env.LOG_LEVEL as EnvConfig['LOG_LEVEL']) || combinedDefaults.LOG_LEVEL!,
    
    // Environment Validation
    ENV_CONFIG_VERSION: process.env.ENV_CONFIG_VERSION || combinedDefaults.ENV_CONFIG_VERSION!,
  };
  
  return config;
}

/**
 * Get environment configuration (cached)
 */
let cachedConfig: EnvConfig | null = null;

export function getEnvConfig(): EnvConfig {
  if (!cachedConfig) {
    cachedConfig = loadEnvConfig();
  }
  return cachedConfig;
}

/**
 * Check if we're in development environment
 */
export function isDevelopment(): boolean {
  return getEnvConfig().NODE_ENV === 'development';
}

/**
 * Check if we're in production environment
 */
export function isProduction(): boolean {
  return getEnvConfig().NODE_ENV === 'production';
}

/**
 * Check if we're in test environment
 */
export function isTest(): boolean {
  return getEnvConfig().NODE_ENV === 'test';
}

/**
 * Get database configuration
 */
export function getDatabaseConfig() {
  const config = getEnvConfig();
  return {
    uri: config.MONGODB_URI,
    dbName: config.MONGODB_DB_NAME,
  };
}

/**
 * Get Clerk configuration
 */
export function getClerkConfig() {
  const config = getEnvConfig();
  return {
    publishableKey: config.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    secretKey: config.CLERK_SECRET_KEY,
    webhookSecret: config.CLERK_WEBHOOK_SECRET,
    signInUrl: config.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    signUpUrl: config.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    afterSignInUrl: config.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
    afterSignUpUrl: config.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
  };
}

/**
 * Reset cached configuration (useful for testing)
 */
export function resetEnvConfig(): void {
  cachedConfig = null;
}