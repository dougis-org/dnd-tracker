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

// Mock env module
jest.mock('../env', () => ({
  getDatabaseConfig: jest.fn(),
  resetEnvConfig: jest.fn(),
}));

import { getDatabaseConfig, resetEnvConfig } from '../env';

const mockedMongoose = mongoose as jest.Mocked<typeof mongoose>;
const mockedGetDatabaseConfig = getDatabaseConfig as jest.MockedFunction<typeof getDatabaseConfig>;
const mockedResetEnvConfig = resetEnvConfig as jest.MockedFunction<typeof resetEnvConfig>;

describe('MongoDB Connection Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment config cache
    mockedResetEnvConfig.mockImplementation(() => {});
  });

  afterEach(async () => {
    // Reset connection state
    mockedMongoose.connection.readyState = 0;
  });

  describe('connectToDatabase', () => {
    it('should connect to database when configuration is valid', async () => {
      mockedGetDatabaseConfig.mockReturnValue({
        uri: 'mongodb://localhost:27017/test',
        dbName: 'dnd-tracker'
      });
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
      mockedGetDatabaseConfig.mockReturnValue({
        uri: 'mongodb://localhost:27017/test',
        dbName: 'dnd-tracker'
      });
      mockedMongoose.connection.readyState = 1; // Connected state
      
      await connectToDatabase();
      
      expect(mockedMongoose.connect).not.toHaveBeenCalled();
    });

    it('should handle connection errors gracefully', async () => {
      mockedGetDatabaseConfig.mockReturnValue({
        uri: 'mongodb://localhost:27017/test',
        dbName: 'dnd-tracker'
      });
      const connectionError = new Error('Connection failed');
      mockedMongoose.connect.mockRejectedValueOnce(connectionError);
      
      await expect(connectToDatabase()).rejects.toThrow('Connection failed');
    });

    it('should use connection pooling options with Atlas URI', async () => {
      mockedGetDatabaseConfig.mockReturnValue({
        uri: 'mongodb+srv://user:pass@cluster.mongodb.net/db',
        dbName: 'dnd-tracker'
      });
      mockedMongoose.connect.mockResolvedValueOnce(mockedMongoose);
      
      await connectToDatabase();
      
      expect(mockedMongoose.connect).toHaveBeenCalledWith(
        'mongodb+srv://user:pass@cluster.mongodb.net/db',
        {
          bufferCommands: false,
        }
      );
    });

    it('should throw error when getDatabaseConfig throws', async () => {
      mockedGetDatabaseConfig.mockImplementation(() => {
        throw new Error('Environment configuration error');
      });
      
      await expect(connectToDatabase()).rejects.toThrow('Environment configuration error');
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