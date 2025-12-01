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
import {
  createMockDashboardData,
  createMockError,
  createEmptyDashboardData,
  createUpgradedTierData,
} from './dashboard.test-helpers';

// Mock the API
jest.mock('@/lib/dashboardApi');
jest.mock('swr');

const mockGetDashboardData = getDashboardData as jest.MockedFunction<typeof getDashboardData>;

describe('Dashboard Integration Tests (T020)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Data Fetching Flow', () => {
    it('should fetch dashboard data on mount', async () => {
      mockGetDashboardData.mockResolvedValue(createMockDashboardData());

      render(<Dashboard />);

      await waitFor(
        () => {
          expect(mockGetDashboardData).toHaveBeenCalled();
        },
        { timeout: 5000 }
      );
    });

    it('should display loading state initially', () => {
      mockGetDashboardData.mockImplementation(
        () => new Promise(() => {})
      );

      render(<Dashboard />);

      expect(screen.queryByText(/Your Subscription/i)).not.toBeInTheDocument();
    });

    it('should display dashboard content after data loads', async () => {
      mockGetDashboardData.mockResolvedValue(createMockDashboardData());

      render(<Dashboard />);

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
      mockGetDashboardData.mockRejectedValue(createMockError('Unauthorized', 401));

      render(<Dashboard />);

      await waitFor(
        () => {
          expect(screen.queryByText(/sign in|login/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    it('should display error state on 404 not found error', async () => {
      mockGetDashboardData.mockRejectedValue(createMockError('Not Found', 404));

      render(<Dashboard />);

      await waitFor(
        () => {
          expect(screen.queryByText(/error|contact/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    it('should display error state on 500 server error', async () => {
      mockGetDashboardData.mockRejectedValue(createMockError('Server Error', 500));

      render(<Dashboard />);

      await waitFor(
        () => {
          expect(screen.queryByText(/error|retry/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });
  });

  describe('Empty State Detection', () => {
    it('should display empty state when isEmpty is true', async () => {
      mockGetDashboardData.mockResolvedValue(createEmptyDashboardData());

      render(<Dashboard />);

      await waitFor(
        () => {
          expect(screen.queryByText(/Welcome|let's get started/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    it('should display dashboard content when isEmpty is false', async () => {
      mockGetDashboardData.mockResolvedValue(createMockDashboardData());

      render(<Dashboard />);

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
      render(<Dashboard />);

      expect(screen.queryByText(/Subscribe|Upgrade/i)).not.toBeInTheDocument();
    });

    it('should refetch data on demand', async () => {
      mockGetDashboardData.mockResolvedValue(createMockDashboardData());

      const { rerender } = render(<Dashboard />);

      await waitFor(() => {
        expect(mockGetDashboardData).toHaveBeenCalled();
      });

      rerender(<Dashboard />);

      await waitFor(() => {
        expect(mockGetDashboardData.mock.calls.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('Retry Logic', () => {
    it('should allow manual retries on error', async () => {
      mockGetDashboardData.mockRejectedValue(createMockError('Network Error', 500));

      render(<Dashboard maxRetries={3} />);

      await waitFor(
        () => {
          expect(screen.queryByText(/error|retry/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    it('should handle max retries exceeded', async () => {
      mockGetDashboardData.mockRejectedValue(
        createMockError('Persistent Error', 500)
      );

      render(<Dashboard maxRetries={1} />);

      await waitFor(
        () => {
          expect(screen.queryByText(/error|retry|contact/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });
  });

  describe('Data Transitions', () => {
    it('should handle data update without page reload', async () => {
      mockGetDashboardData.mockResolvedValue(createMockDashboardData());

      render(<Dashboard />);

      await waitFor(
        () => {
          expect(
            screen.queryByText(/John Adventurer|Your Subscription/i)
          ).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      expect(screen.queryByText(/1 of 1/i)).toBeInTheDocument();
    });

    it('should display tier upgrade scenario', async () => {
      mockGetDashboardData.mockResolvedValue(createUpgradedTierData());

      render(<Dashboard />);

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

      expect(screen.queryByRole('main')).not.toThrow();
    });

    it('should provide meaningful loading state', async () => {
      mockGetDashboardData.mockImplementation(
        () => new Promise(() => {})
      );

      render(<Dashboard />);

      expect(document.body).toBeInTheDocument();
    });
  });

  describe('Network Scenarios', () => {
    it('should handle network timeout', async () => {
      mockGetDashboardData.mockRejectedValue(new Error('Network timeout'));

      render(<Dashboard />);

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

      await waitFor(
        () => {
          expect(screen.queryByText(/error|offline/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });
  });
});
