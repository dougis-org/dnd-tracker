 
const { startMongoContainer } = require('./mongo-testcontainers');
const mongoose = require('mongoose');

module.exports = async function globalSetup() {
  // Start a single MongoDB container for the integration test suite
  const uri = await startMongoContainer();
   
  console.log('Global setup: obtained Mongo URI', uri);
  process.env.MONGODB_URI = uri;
  process.env.MONGODB_DB_NAME =
    process.env.MONGODB_DB_NAME || 'dnd-tracker-test';
  process.env.JEST_INTEGRATION = 'true';

  // Connect mongoose now so tests which call adapter.create directly don't
  // have to manage connection themselves
  // Retry connecting a few times since the container may not be ready immediately
  const maxAttempts = 6;
  let lastErr = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await mongoose.connect(uri, {
        dbName: process.env.MONGODB_DB_NAME,
        // Ensure we don't try to resolve replica set hostnames returned by the
        // server (which may be internal container hostnames) - use direct
        // connection to the mapped port.
        directConnection: true,
        // Optional: set server selection timeout to a reasonable value
        serverSelectionTimeoutMS: 10000,
      });
       
      console.log('Integration tests: connected to MongoDB in globalSetup');
      lastErr = null;
      break;
    } catch (err) {
      lastErr = err;
       
      console.warn(
        `Global setup connect attempt ${attempt} failed: ${err.message}`
      );
      // exponential backoff
       
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
  if (lastErr) {
     
    console.error(
      'Integration tests: failed to connect to MongoDB in globalSetup after retries',
      lastErr
    );
    throw lastErr;
  }
};
