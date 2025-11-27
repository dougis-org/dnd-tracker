#!/usr/bin/env node
/**
 * Manual migration CLI script
 * Usage: node scripts/migrate.js
 * 
 * Can be run before deployment or on demand to ensure all migrations have executed
 */

import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import('dotenv').then(({ default: dotenv }) => {
  dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
}).catch(() => {
  // dotenv not available, continue
});

async function migrate() {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    console.error('❌ MONGODB_URI environment variable is not set');
    console.error('Please set MONGODB_URI before running migrations');
    process.exit(1);
  }

  try {
    console.log('🚀 Starting migration process...');
    console.log(`📍 Connecting to: ${mongoUri.replace(/:[^:]*@/, ':***@')}`);

    // Import after environment is loaded
    const { connectToMongo } = await import('../src/lib/db/connection.js');
    const { runMigrations } = await import('../src/lib/db/migrations/index.js');

    const connection = await connectToMongo();
    console.log('✅ Connected to MongoDB');

    const migrationsRun = await runMigrations(connection);

    if (migrationsRun) {
      console.log('✅ Migrations completed successfully');
    } else {
      console.log('ℹ️  All migrations already applied');
    }

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:');
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

migrate();
