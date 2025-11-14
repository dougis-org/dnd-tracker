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

// Mock the fetcher module
jest.mock('@/lib/subscription/fetchers', () => ({
  fetchSubscriptionData: jest.fn(),
}));

import { fetchSubscriptionData } from '@/lib/subscription/fetchers';

const mockFetchSubscriptionData = fetchSubscriptionData as jest.MockedFunction<
  typeof fetchSubscriptionData
>;

describe('SubscriptionPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockFetchSubscriptionData.mockImplementation(
      () => new Promise(() => {})
    );
    render(<SubscriptionPage />);
    expect(screen.getByTestId('subscription-page-skeleton')).toBeInTheDocument();
  });

  it('renders page after successful data fetch', async () => {
    const subscription = createMockSubscription();
    const usageMetrics = createMockUsageMetrics();
    const availablePlans = createMockPlans();

    mockFetchSubscriptionData.mockResolvedValueOnce({
      subscription,
      usageMetrics,
      availablePlans,
    });

    render(<SubscriptionPage />);
    await waitFor(() => {
      expect(screen.getByTestId('subscription-page')).toBeInTheDocument();
    });
  });

  it('displays error on fetch failure', async () => {
    mockFetchSubscriptionData.mockRejectedValueOnce(
      new Error('Network error')
    );
    render(<SubscriptionPage />);
    await waitFor(() => {
      expect(screen.getByTestId('subscription-page-error')).toBeInTheDocument();
    });
  });

  it('shows retry button on error', async () => {
    mockFetchSubscriptionData.mockRejectedValueOnce(
      new Error('Network error')
    );
    render(<SubscriptionPage />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Retry/ })).toBeInTheDocument();
    });
  });

  it('retries fetch on button click', async () => {
    mockFetchSubscriptionData.mockRejectedValueOnce(
      new Error('Network error')
    );
    render(<SubscriptionPage />);

    await waitFor(() => {
      expect(screen.getByTestId('subscription-page-error')).toBeInTheDocument();
    });

    const subscription = createMockSubscription();
    const usageMetrics = createMockUsageMetrics();
    const availablePlans = createMockPlans();

    mockFetchSubscriptionData.mockResolvedValueOnce({
      subscription,
      usageMetrics,
      availablePlans,
    });

    fireEvent.click(screen.getByRole('button', { name: /Retry/ }));

    await waitFor(() => {
      expect(screen.getByTestId('subscription-page')).toBeInTheDocument();
    });
  });

  it('renders subscription title and sections', async () => {
    const subscription = createMockSubscription();
    const usageMetrics = createMockUsageMetrics();
    const availablePlans = createMockPlans();

    mockFetchSubscriptionData.mockResolvedValueOnce({
      subscription,
      usageMetrics,
      availablePlans,
    });

    render(<SubscriptionPage />);
    
    // Wait for the component to render and fetch data
    await waitFor(
      () => {
        expect(screen.getByText('Subscription & Billing')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
    expect(screen.getByRole('heading', { name: /Current Plan/ })).toBeInTheDocument();
    expect(screen.getByText('Usage')).toBeInTheDocument();
  });

  it('fetches subscription data on mount', async () => {
    const subscription = createMockSubscription();
    const usageMetrics = createMockUsageMetrics();
    const availablePlans = createMockPlans();

    mockFetchSubscriptionData.mockResolvedValueOnce({
      subscription,
      usageMetrics,
      availablePlans,
    });

    render(<SubscriptionPage />);
    await waitFor(() => {
      expect(mockFetchSubscriptionData).toHaveBeenCalled();
    });
  });

  it('calls onNavigate with manage-plan', async () => {
    const subscription = createMockSubscription({ status: 'active' });
    const usageMetrics = createMockUsageMetrics();
    const availablePlans = createMockPlans();

    mockFetchSubscriptionData.mockResolvedValueOnce({
      subscription,
      usageMetrics,
      availablePlans,
    });

    const mockOnNavigate = jest.fn();
    render(<SubscriptionPage onNavigate={mockOnNavigate} />);

    await waitFor(() => {
      const manageButton = screen.getByRole('button', { name: /Manage/ });
      fireEvent.click(manageButton);
      expect(mockOnNavigate).toHaveBeenCalledWith('manage-plan');
    });
  });
});
