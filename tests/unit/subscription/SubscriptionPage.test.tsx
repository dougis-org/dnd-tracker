/**
 * SubscriptionPage Component Tests
 * User Story 1, Phase 3 - Subscription Page
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SubscriptionPage } from '@/components/subscription/SubscriptionPage';
import {
  createMockSubscription,
  createMockUsageMetrics,
  createMockPlans,
} from '@fixtures/subscription-fixtures';

// Mock fetch for API calls
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('SubscriptionPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));
    render(<SubscriptionPage />);
    expect(screen.getByTestId('subscription-page-skeleton')).toBeInTheDocument();
  });

  it('renders page after successful data fetch', async () => {
    const subscription = createMockSubscription();
    const usageMetrics = createMockUsageMetrics();
    const availablePlans = createMockPlans();

    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ subscription, usageMetrics, availablePlans }),
        { status: 200 }
      )
    );

    render(<SubscriptionPage />);
    await waitFor(() => {
      expect(screen.getByTestId('subscription-page')).toBeInTheDocument();
    });
  });

  it('displays error on fetch failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    render(<SubscriptionPage />);
    await waitFor(() => {
      expect(screen.getByTestId('subscription-page-error')).toBeInTheDocument();
    });
  });

  it('shows retry button on error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    render(<SubscriptionPage />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Retry/ })).toBeInTheDocument();
    });
  });

  it('retries fetch on button click', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    render(<SubscriptionPage />);

    await waitFor(() => {
      expect(screen.getByTestId('subscription-page-error')).toBeInTheDocument();
    });

    const subscription = createMockSubscription();
    const usageMetrics = createMockUsageMetrics();
    const availablePlans = createMockPlans();

    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ subscription, usageMetrics, availablePlans }),
        { status: 200 }
      )
    );

    fireEvent.click(screen.getByRole('button', { name: /Retry/ }));

    await waitFor(() => {
      expect(screen.getByTestId('subscription-page')).toBeInTheDocument();
    });
  });

  it('renders subscription title and sections', async () => {
    const subscription = createMockSubscription();
    const usageMetrics = createMockUsageMetrics();
    const availablePlans = createMockPlans();

    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ subscription, usageMetrics, availablePlans }),
        { status: 200 }
      )
    );

    render(<SubscriptionPage />);
    await waitFor(() => {
      expect(screen.getByText('Subscription & Billing')).toBeInTheDocument();
      expect(screen.getByText('Current Plan')).toBeInTheDocument();
      expect(screen.getByText('Usage')).toBeInTheDocument();
    });
  });

  it('fetches from /api/subscription endpoint', async () => {
    const subscription = createMockSubscription();
    const usageMetrics = createMockUsageMetrics();
    const availablePlans = createMockPlans();

    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ subscription, usageMetrics, availablePlans }),
        { status: 200 }
      )
    );

    render(<SubscriptionPage />);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/subscription');
    });
  });

  it('calls onNavigate with manage-plan', async () => {
    const subscription = createMockSubscription({ status: 'active' });
    const usageMetrics = createMockUsageMetrics();
    const availablePlans = createMockPlans();

    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ subscription, usageMetrics, availablePlans }),
        { status: 200 }
      )
    );

    const mockOnNavigate = jest.fn();
    render(<SubscriptionPage onNavigate={mockOnNavigate} />);

    await waitFor(() => {
      const manageButton = screen.getByRole('button', { name: /Manage/ });
      fireEvent.click(manageButton);
      expect(mockOnNavigate).toHaveBeenCalledWith('manage-plan');
    });
  });
});
