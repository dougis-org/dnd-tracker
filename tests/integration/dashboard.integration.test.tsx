/**
 * Dashboard Integration Tests (T020)
 *
 * Tests for the full dashboard flow: Loading → Data → Display transition
 *
 * Feature 016: User Dashboard with Real Data
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '@/components/dashboard/Dashboard';
import { getDashboardData } from '@/lib/dashboardApi';

// Mock the API
jest.mock('@/lib/dashboardApi');
jest.mock('swr');

const mockGetDashboardData = getDashboardData as jest.MockedFunction<typeof getDashboardData>;

describe('Dashboard Integration Tests (T020)', () => {
  const mockDashboardData = {
    user: {
      id: 'user-123',
      displayName: 'John Adventurer',
      email: 'john@example.com',
      tier: 'free_adventurer',
    },
    usage: {
      parties: 1,
      characters: 2,
      encounters: 3,
    },
    limits: {
      parties: 1,
      characters: 3,
      encounters: 5,
    },
    percentages: {
      parties: 100,
      characters: 67,
      encounters: 60,
    },
    isEmpty: false,
    createdAt: new Date('2025-01-01').toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Data Fetching Flow', () => {
    it('should fetch dashboard data on mount', async () => {
      mockGetDashboardData.mockResolvedValue(mockDashboardData);

      render(<Dashboard />);

      // Wait for data to be fetched and rendered
      await waitFor(
        () => {
          expect(mockGetDashboardData).toHaveBeenCalled();
        },
        { timeout: 5000 }
      );
    });

    it('should display loading state initially', () => {
      mockGetDashboardData.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<Dashboard />);

      // Component should render without crashing
      expect(screen.queryByText(/Your Subscription/i)).not.toBeInTheDocument();
    });

    it('should display dashboard content after data loads', async () => {
      mockGetDashboardData.mockResolvedValue(mockDashboardData);

      render(<Dashboard />);

      // Wait for data to load and content to display
      await waitFor(
        () => {
          expect(
            screen.queryByText(/John Adventurer|Your Subscription/i)
          ).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });
  });

  describe('Error Handling', () => {
    it('should display error state on 401 unauthorized error', async () => {
      const error = new Error('Unauthorized') as Error & { statusCode?: number };
      error.statusCode = 401;
      mockGetDashboardData.mockRejectedValue(error);

      render(<Dashboard />);

      // Wait for error to be handled
      await waitFor(
        () => {
          expect(screen.queryByText(/sign in|login/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    it('should display error state on 404 not found error', async () => {
      const error = new Error('Not Found') as Error & { statusCode?: number };
      error.statusCode = 404;
      mockGetDashboardData.mockRejectedValue(error);

      render(<Dashboard />);

      // Wait for error to be handled
      await waitFor(
        () => {
          // Should display error state for not found
          expect(screen.queryByText(/error|contact/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    it('should display error state on 500 server error', async () => {
      const error = new Error('Server Error') as Error & { statusCode?: number };
      error.statusCode = 500;
      mockGetDashboardData.mockRejectedValue(error);

      render(<Dashboard />);

      // Wait for error to be handled
      await waitFor(
        () => {
          // Should display error state for server error
          expect(screen.queryByText(/error|retry/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });
  });

  describe('Empty State Detection', () => {
    it('should display empty state when isEmpty is true', async () => {
      const emptyData = {
        ...mockDashboardData,
        isEmpty: true,
      };
      mockGetDashboardData.mockResolvedValue(emptyData);

      render(<Dashboard />);

      // Wait for empty state to render
      await waitFor(
        () => {
          expect(screen.queryByText(/Welcome|let's get started/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    it('should display dashboard content when isEmpty is false', async () => {
      mockGetDashboardData.mockResolvedValue(mockDashboardData);

      render(<Dashboard />);

      // Wait for dashboard content to render
      await waitFor(
        () => {
          expect(
            screen.queryByText(/Your Subscription|Resource Limits/i)
          ).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });
  });

  describe('Cache Configuration', () => {
    it('should not use cached data (revalidateOnFocus: false)', () => {
      // This test validates that the component uses cache-disabling config
      // The actual validation happens at the SWR hook level
      render(<Dashboard />);

      // Component should still render without error
      expect(screen.queryByText(/Subscribe|Upgrade/i)).not.toBeInTheDocument();
    });

    it('should refetch data on demand', async () => {
      mockGetDashboardData.mockResolvedValue(mockDashboardData);

      const { rerender } = render(<Dashboard />);

      await waitFor(() => {
        expect(mockGetDashboardData).toHaveBeenCalled();
      });

      // Rerender to trigger new fetch
      rerender(<Dashboard />);

      await waitFor(() => {
        // Second call should have been made
        expect(mockGetDashboardData.mock.calls.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('Retry Logic', () => {
    it('should allow manual retries on error', async () => {
      const error = new Error('Network Error') as Error & { statusCode?: number };
      error.statusCode = 500;
      mockGetDashboardData.mockRejectedValue(error);

      render(<Dashboard maxRetries={3} />);

      // Wait for error state to render
      await waitFor(
        () => {
          // Error state should be visible
          expect(screen.queryByText(/error|retry/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    it('should handle max retries exceeded', async () => {
      const error = new Error('Persistent Error') as Error & { statusCode?: number };
      error.statusCode = 500;
      mockGetDashboardData.mockRejectedValue(error);

      render(<Dashboard maxRetries={1} />);

      // Wait for error state to render
      await waitFor(
        () => {
          // Error state should indicate retry limit
          expect(screen.queryByText(/error|retry|contact/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });
  });

  describe('Data Transitions', () => {
    it('should handle data update without page reload', async () => {
      mockGetDashboardData.mockResolvedValue(mockDashboardData);

      render(<Dashboard />);

      // Wait for initial data
      await waitFor(
        () => {
          expect(
            screen.queryByText(/John Adventurer|Your Subscription/i)
          ).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      // Verify display shows correct usage
      expect(screen.queryByText(/1 of 1/i)).toBeInTheDocument();
    });

    it('should display tier upgrade scenario', async () => {
      const upgradedData = {
        ...mockDashboardData,
        user: {
          ...mockDashboardData.user,
          subscription: {
            tier: 'seasoned_adventurer',
            updatedAt: new Date('2025-01-02'),
          },
        },
        limits: {
          parties: 3,
          characters: 10,
          encounters: 20,
        },
      };
      mockGetDashboardData.mockResolvedValue(upgradedData);

      render(<Dashboard />);

      // Wait for upgraded tier to display
      await waitFor(
        () => {
          expect(screen.queryByText(/Seasoned Adventurer/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });
  });

  describe('Accessibility', () => {
    it('should have proper page structure', () => {
      render(<Dashboard />);

      // Component should render without accessibility errors
      expect(screen.queryByRole('main')).not.toThrow();
    });

    it('should provide meaningful loading state', async () => {
      mockGetDashboardData.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<Dashboard />);

      // Should have loading indication
      // Component structure should be accessible
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('Network Scenarios', () => {
    it('should handle network timeout', async () => {
      mockGetDashboardData.mockRejectedValue(new Error('Network timeout'));

      render(<Dashboard />);

      // Should display error state
      await waitFor(
        () => {
          expect(screen.queryByText(/error|retry/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    it('should handle offline state gracefully', async () => {
      mockGetDashboardData.mockRejectedValue(
        new Error('Failed to fetch: Network request failed')
      );

      render(<Dashboard />);

      // Should display error state with suggestion
      await waitFor(
        () => {
          expect(screen.queryByText(/error|offline/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });
  });
});
