/**
 * Dashboard Metrics API Route Tests
 * Tests for GET /api/dashboard/metrics endpoint
 */

import { GET } from '@/app/api/dashboard/metrics/route';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/db/connection';
import User from '@/lib/db/models/User';
import { getDashboardMetrics } from '@/lib/services/dashboardService';

// Mock dependencies
jest.mock('@clerk/nextjs/server');
jest.mock('@/lib/db/connection');
jest.mock('@/lib/db/models/User');
jest.mock('@/lib/services/dashboardService');

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockConnectToDatabase = connectToDatabase as jest.MockedFunction<typeof connectToDatabase>;
const mockGetDashboardMetrics = getDashboardMetrics as jest.MockedFunction<typeof getDashboardMetrics>;

describe('/api/dashboard/metrics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return dashboard metrics for authenticated user', async () => {
      // Mock auth
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);

      // Mock database connection
      mockConnectToDatabase.mockResolvedValue(undefined);

      // Mock user
      const mockUser = {
        _id: 'mock-id',
        id: 'user_123',
        email: 'test@example.com',
      };
      (User.findByClerkId as jest.Mock).mockResolvedValue(mockUser);

      // Mock metrics
      const mockMetrics = {
        user: { displayName: 'Test User' },
        subscription: { tier: 'free' },
        metrics: { sessionsCount: 5 },
      };
      mockGetDashboardMetrics.mockResolvedValue(mockMetrics as any);

      // Execute
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual(mockMetrics);
      expect(User.findByClerkId).toHaveBeenCalledWith('user_123');
      expect(mockGetDashboardMetrics).toHaveBeenCalledWith(mockUser);
    });

    it('should return 401 for unauthenticated user', async () => {
      // Mock no auth
      mockAuth.mockResolvedValue({ userId: null } as any);

      // Execute
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
      expect(data.message).toBe('You must be logged in to access dashboard metrics');
    });

    it('should return 404 if user not found', async () => {
      // Mock auth
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);

      // Mock database connection
      mockConnectToDatabase.mockResolvedValue(undefined);

      // Mock user not found
      (User.findByClerkId as jest.Mock).mockResolvedValue(null);

      // Execute
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
      expect(data.message).toBe('Your user profile could not be found');
    });

    it('should return 500 on database error', async () => {
      // Mock auth
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);

      // Mock database error
      mockConnectToDatabase.mockRejectedValue(new Error('Database connection failed'));

      // Execute
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(data.message).toBe('Failed to fetch dashboard metrics');
    });

    it('should return 404 when getDashboardMetrics throws User not found error', async () => {
      // Mock auth
      mockAuth.mockResolvedValue({ userId: 'user_123' } as any);

      // Mock database connection
      mockConnectToDatabase.mockResolvedValue(undefined);

      // Mock user
      const mockUser = {
        _id: 'mock-id',
        id: 'user_123',
        email: 'test@example.com',
      };
      (User.findByClerkId as jest.Mock).mockResolvedValue(mockUser);

      // Mock service throwing User not found error
      mockGetDashboardMetrics.mockRejectedValue(new Error('User not found'));

      // Execute
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
      expect(data.message).toBe('Your user profile could not be found');
    });
  });
});
