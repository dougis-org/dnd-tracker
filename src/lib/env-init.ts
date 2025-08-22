/**
 * Environment Initialization Module
 * 
 * This module ensures environment variables are validated early in the application lifecycle.
 * It should be imported at the top level of the application to catch configuration errors
 * before any other code runs.
 */

import { loadEnvConfig, EnvValidationError } from './env';

/**
 * Initialize and validate environment configuration
 * 
 * This function should be called once at application startup to ensure
 * all required environment variables are properly configured.
 */
export function initializeEnvironment(): void {
  try {
    // Load and validate environment configuration
    loadEnvConfig();
    
    // Log successful initialization in development
    if (process.env.NODE_ENV === 'development') {
      console.log('✓ Environment configuration loaded successfully');
    }
  } catch (error) {
    if (error instanceof EnvValidationError) {
      console.error('❌ Environment Configuration Error:');
      console.error(error.message);
      
      if (error.missingVars.length > 0) {
        console.error('\nMissing variables:');
        error.missingVars.forEach(varName => {
          console.error(`  - ${varName}`);
        });
      }
      
      if (error.invalidVars.length > 0) {
        console.error('\nInvalid variables:');
        error.invalidVars.forEach(errorMsg => {
          console.error(`  - ${errorMsg}`);
        });
      }
      
      console.error('\nPlease check your .env.local file and ensure all required variables are set.');
      console.error('Refer to .env.example for the complete list of required variables.\n');
    } else {
      console.error('❌ Unexpected error during environment initialization:', error);
    }
    
    // Exit in production/test, throw in development for better debugging
    if (process.env.NODE_ENV === 'development') {
      throw error;
    } else {
      process.exit(1);
    }
  }
}

/**
 * Environment validation middleware for API routes
 * 
 * This can be used to ensure environment is properly configured
 * before processing API requests.
 */
export function validateEnvironmentMiddleware() {
  return (req: unknown, res: unknown, next: () => void) => {
    try {
      loadEnvConfig();
      next();
    } catch (error) {
      if (error instanceof EnvValidationError) {
        // In API context, we should return an error response
        // rather than crash the process
        throw new Error('Server configuration error: Environment variables not properly configured');
      }
      throw error;
    }
  };
}