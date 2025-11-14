/**
 * PlanCard Component Tests (23 tests)
 * User Story 1, Phase 3 - Subscription Page
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { PlanCard } from '@/components/subscription/PlanCard';
import { createMockSubscription } from '@fixtures/subscription-fixtures';

describe('PlanCard Component', () => {
  describe('rendering with paid subscription', () => {
    it('should render the plan name', () => {
      const subscription = createMockSubscription({
        planName: 'Master DM',
      });
      render(<PlanCard subscription={subscription} />);
      expect(screen.getByText('Master DM')).toBeInTheDocument();
    });

    it('should display "Current Plan" badge for active paid subscriptions', () => {
      const subscription = createMockSubscription({
        status: 'active',
      });
      render(<PlanCard subscription={subscription} />);
      expect(screen.getByText('Current Plan')).toBeInTheDocument();
    });

    it('should display the renewal date in human-readable format', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const subscription = createMockSubscription({
        renewalDate: futureDate,
      });
      render(<PlanCard subscription={subscription} />);
      expect(screen.getByText(/Renews/)).toBeInTheDocument();
      // Format should match Intl.DateTimeFormat output
      expect(
        screen.getByText(new RegExp(futureDate.getFullYear().toString()))
      ).toBeInTheDocument();
    });

    it('should display billing frequency as "Yearly" for annual', () => {
      const subscription = createMockSubscription({
        billingFrequency: 'annual',
      });
      render(<PlanCard subscription={subscription} />);
      expect(screen.getByText('Yearly')).toBeInTheDocument();
    });

    it('should display billing frequency as "Monthly" for monthly', () => {
      const subscription = createMockSubscription({
        billingFrequency: 'monthly',
      });
      render(<PlanCard subscription={subscription} />);
      expect(screen.getByText('Monthly')).toBeInTheDocument();
    });

    it('should render "Manage" button for paid subscriptions', () => {
      const subscription = createMockSubscription({
        status: 'active',
      });
      render(<PlanCard subscription={subscription} />);
      const manageButton = screen.getByRole('button', { name: /Manage/ });
      expect(manageButton).toBeInTheDocument();
    });

    it('should call onManage when Manage button is clicked', () => {
      const mockOnManage = jest.fn();
      const subscription = createMockSubscription({
        status: 'active',
      });
      render(
        <PlanCard subscription={subscription} onManage={mockOnManage} />
      );
      const manageButton = screen.getByRole('button', { name: /Manage/ });
      fireEvent.click(manageButton);
      expect(mockOnManage).toHaveBeenCalledTimes(1);
    });

    it('should show "Renewing tomorrow" message when renewal is tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const subscription = createMockSubscription({
        renewalDate: tomorrow,
      });
      render(<PlanCard subscription={subscription} />);
      expect(screen.getByText(/Renewing tomorrow/)).toBeInTheDocument();
    });

    it('should show "Expired" message when renewal date is in the past', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const subscription = createMockSubscription({
        renewalDate: yesterday,
      });
      render(<PlanCard subscription={subscription} />);
      expect(screen.getByText(/Expired/)).toBeInTheDocument();
    });
  });

  describe('rendering with trial subscription', () => {
    it('should display "Trial" badge for trial status', () => {
      const subscription = createMockSubscription({
        status: 'trial',
        trialDaysRemaining: 7,
      });
      render(
        <PlanCard
          subscription={subscription}
          trialDaysRemaining={7}
        />
      );
      expect(screen.getByText('Trial')).toBeInTheDocument();
    });

    it('should display trial days remaining', () => {
      const subscription = createMockSubscription({
        status: 'trial',
      });
      render(
        <PlanCard
          subscription={subscription}
          trialDaysRemaining={14}
        />
      );
      expect(screen.getByText(/Trial ends in/)).toBeInTheDocument();
      expect(screen.getByText(/14 days/)).toBeInTheDocument();
    });

    it('should use singular "day" when 1 day remaining', () => {
      const subscription = createMockSubscription({
        status: 'trial',
      });
      render(
        <PlanCard
          subscription={subscription}
          trialDaysRemaining={1}
        />
      );
      expect(screen.getByText(/1 day/)).toBeInTheDocument();
    });

    it('should show warning when 3 or fewer days remaining', () => {
      const subscription = createMockSubscription({
        status: 'trial',
      });
      render(
        <PlanCard
          subscription={subscription}
          trialDaysRemaining={3}
        />
      );
      expect(screen.getByText(/Your trial expires soon/)).toBeInTheDocument();
    });

    it('should not show warning when more than 3 days remaining', () => {
      const subscription = createMockSubscription({
        status: 'trial',
      });
      render(
        <PlanCard
          subscription={subscription}
          trialDaysRemaining={4}
        />
      );
      expect(screen.queryByText(/Your trial expires soon/)).not.toBeInTheDocument();
    });

    it('should render "Choose Plan" button for trial subscriptions', () => {
      const subscription = createMockSubscription({
        status: 'trial',
      });
      render(
        <PlanCard
          subscription={subscription}
          trialDaysRemaining={7}
        />
      );
      const choosePlanButton = screen.getByRole('button', {
        name: /Choose Plan/,
      });
      expect(choosePlanButton).toBeInTheDocument();
    });

    it('should call onChoosePlan when Choose Plan button is clicked', () => {
      const mockOnChoosePlan = jest.fn();
      const subscription = createMockSubscription({
        status: 'trial',
      });
      render(
        <PlanCard
          subscription={subscription}
          trialDaysRemaining={7}
          onChoosePlan={mockOnChoosePlan}
        />
      );
      const choosePlanButton = screen.getByRole('button', {
        name: /Choose Plan/,
      });
      fireEvent.click(choosePlanButton);
      expect(mockOnChoosePlan).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('should have role="region" for semantic structure', () => {
      const subscription = createMockSubscription();
      render(<PlanCard subscription={subscription} />);
      const card = screen.getByTestId('plan-card');
      expect(card).toHaveAttribute('role', 'region');
    });

    it('should have proper heading hierarchy with h2', () => {
      const subscription = createMockSubscription({
        planName: 'Test Plan',
      });
      render(<PlanCard subscription={subscription} />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Test Plan');
    });

    it('should have accessible button text', () => {
      const subscription = createMockSubscription({
        status: 'active',
      });
      render(<PlanCard subscription={subscription} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAccessibleName('Manage');
    });
  });

  describe('status badge styling', () => {
    it('should render status badge with testid matching status', () => {
      const subscription = createMockSubscription({
        status: 'active',
      });
      render(<PlanCard subscription={subscription} />);
      expect(screen.getByTestId('status-active')).toBeInTheDocument();
    });

    it('should render paused status badge correctly', () => {
      const subscription = createMockSubscription({
        status: 'paused',
      });
      render(<PlanCard subscription={subscription} />);
      expect(screen.getByTestId('status-paused')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle null trialDaysRemaining for paid subscriptions', () => {
      const subscription = createMockSubscription({
        status: 'active',
        trialDaysRemaining: null,
      });
      render(<PlanCard subscription={subscription} />);
      expect(screen.queryByText(/Trial ends in/)).not.toBeInTheDocument();
      expect(screen.getByText(/Renews/)).toBeInTheDocument();
    });

    it('should handle undefined trialDaysRemaining prop', () => {
      const subscription = createMockSubscription({
        status: 'active',
      });
      render(<PlanCard subscription={subscription} />);
      expect(screen.getByRole('button', { name: /Manage/ })).toBeInTheDocument();
    });

    it('should render without crashing when callbacks are undefined', () => {
      const subscription = createMockSubscription();
      render(<PlanCard subscription={subscription} />);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      // Should not crash
      expect(button).toBeInTheDocument();
    });
  });
});
