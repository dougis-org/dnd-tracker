import mongoose from 'mongoose';
import { getDatabaseConfig } from './env';

let isConnected = false;

export async function connectToDatabase(): Promise<void> {
  const { uri: MONGODB_URI } = getDatabaseConfig();

  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    isConnected = true;
  } catch (error) {
    isConnected = false;
    throw error;
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  await mongoose.disconnect();
  isConnected = false;
}

export function getConnectionStatus(): string {
  switch (mongoose.connection.readyState) {
    case 0:
      return 'disconnected';
    case 1:
      return 'connected';
    case 2:
      return 'connecting';
    case 3:
      return 'disconnecting';
    default:
      return 'unknown';
  }
}