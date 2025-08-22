import mongoose from 'mongoose';
import { connectToDatabase, disconnectFromDatabase, getConnectionStatus } from '../mongodb';

// Mock mongoose
jest.mock('mongoose', () => ({
  connect: jest.fn(),
  disconnect: jest.fn(),
  connection: {
    readyState: 0,
  },
}));

const mockedMongoose = mongoose as jest.Mocked<typeof mongoose>;

describe('MongoDB Connection Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variable
    delete process.env.MONGODB_URI;
  });

  afterEach(async () => {
    // Reset connection state
    mockedMongoose.connection.readyState = 0;
  });

  describe('connectToDatabase', () => {
    it('should throw error when MONGODB_URI is not defined', async () => {
      await expect(connectToDatabase()).rejects.toThrow(
        'Please define MONGODB_URI in .env.local'
      );
    });

    it('should throw error when MONGODB_URI is empty string', async () => {
      process.env.MONGODB_URI = '';
      await expect(connectToDatabase()).rejects.toThrow(
        'Please define MONGODB_URI in .env.local'
      );
    });

    it('should connect to database when MONGODB_URI is valid', async () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
      mockedMongoose.connect.mockResolvedValueOnce(mockedMongoose);
      
      await connectToDatabase();
      
      expect(mockedMongoose.connect).toHaveBeenCalledWith(
        'mongodb://localhost:27017/test',
        {
          bufferCommands: false,
        }
      );
    });

    it('should not reconnect if already connected', async () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
      mockedMongoose.connection.readyState = 1; // Connected state
      
      await connectToDatabase();
      
      expect(mockedMongoose.connect).not.toHaveBeenCalled();
    });

    it('should handle connection errors gracefully', async () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
      const connectionError = new Error('Connection failed');
      mockedMongoose.connect.mockRejectedValueOnce(connectionError);
      
      await expect(connectToDatabase()).rejects.toThrow('Connection failed');
    });

    it('should use connection pooling options', async () => {
      process.env.MONGODB_URI = 'mongodb+srv://user:pass@cluster.mongodb.net/db';
      mockedMongoose.connect.mockResolvedValueOnce(mockedMongoose);
      
      await connectToDatabase();
      
      expect(mockedMongoose.connect).toHaveBeenCalledWith(
        'mongodb+srv://user:pass@cluster.mongodb.net/db',
        {
          bufferCommands: false,
        }
      );
    });
  });

  describe('disconnectFromDatabase', () => {
    it('should disconnect from database', async () => {
      mockedMongoose.disconnect.mockResolvedValueOnce(undefined);
      
      await disconnectFromDatabase();
      
      expect(mockedMongoose.disconnect).toHaveBeenCalled();
    });

    it('should handle disconnection errors', async () => {
      const disconnectionError = new Error('Disconnection failed');
      mockedMongoose.disconnect.mockRejectedValueOnce(disconnectionError);
      
      await expect(disconnectFromDatabase()).rejects.toThrow('Disconnection failed');
    });
  });

  describe('getConnectionStatus', () => {
    it('should return disconnected when readyState is 0', () => {
      mockedMongoose.connection.readyState = 0;
      expect(getConnectionStatus()).toBe('disconnected');
    });

    it('should return connected when readyState is 1', () => {
      mockedMongoose.connection.readyState = 1;
      expect(getConnectionStatus()).toBe('connected');
    });

    it('should return connecting when readyState is 2', () => {
      mockedMongoose.connection.readyState = 2;
      expect(getConnectionStatus()).toBe('connecting');
    });

    it('should return disconnecting when readyState is 3', () => {
      mockedMongoose.connection.readyState = 3;
      expect(getConnectionStatus()).toBe('disconnecting');
    });

    it('should return unknown for unexpected readyState', () => {
      mockedMongoose.connection.readyState = 99;
      expect(getConnectionStatus()).toBe('unknown');
    });
  });
});