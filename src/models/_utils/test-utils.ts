// Shared test utilities for model tests
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

export let mongoServer: MongoMemoryServer;

export async function setupTestDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}

export async function teardownTestDatabase() {
  await mongoose.disconnect();
  await mongoServer.stop();
}
