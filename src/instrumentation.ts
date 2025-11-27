import { connectToMongo } from '@/lib/db/connection';
import { runMigrations } from '@/lib/db/migrations';
import { logStructured } from '@/lib/utils/logger';

/**
 * Next.js instrumentation hook
 * Runs on application startup (both dev and production)
 * See: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  try {
    logStructured('info', 'Application initializing - running startup tasks');

    // Only run migrations if MONGODB_URI is configured
    if (process.env.MONGODB_URI) {
      try {
        logStructured('info', 'Connecting to MongoDB for migrations');
        const connection = await connectToMongo();

        logStructured('info', 'MongoDB connected, running migrations');
        await runMigrations(connection);

        logStructured('info', 'Migrations completed successfully');
      } catch (err) {
        // Log error but don't crash the app
        // In development, this might be a temporary connection issue
        // In production, this will be retried on the next request or health check
        logStructured('error', 'Migration initialization failed', {
          error: err instanceof Error ? err.message : String(err),
          nodeEnv: process.env.NODE_ENV,
        });

        // In production, this is a critical error
        if (process.env.NODE_ENV === 'production') {
          // Don't throw - let the app start, but migrations may retry
          logStructured('warn', 'Application starting despite migration failure - migrations will retry on first DB access');
        }
      }
    } else {
      logStructured('warn', 'MONGODB_URI not configured - skipping migrations');
    }
  } catch (err) {
    logStructured('error', 'Unexpected error during application initialization', {
      error: err instanceof Error ? err.message : String(err),
    });
    // Don't throw - let app continue
  }
}
