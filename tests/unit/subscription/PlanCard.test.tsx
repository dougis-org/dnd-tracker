/**
 * PlanCard Component Tests (23 tests)
 * User Story 1, Phase 3 - Subscription Page
 * Uses parameterized testing to reduce duplication
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { PlanCard } from '@/components/subscription/PlanCard';
import { createMockSubscription } from '@fixtures/subscription-fixtures';
import {
  SUBSCRIPTION_TEST_SCENARIOS,
  TRIAL_DAY_SCENARIOS,
  STATUS_BADGE_SCENARIOS,
  BILLING_FREQUENCY_SCENARIOS,
  RENEWAL_DATE_SCENARIOS,
  createRenewalDateOffset,
} from './test-data';

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

    it.each(RENEWAL_DATE_SCENARIOS)(
      'should display correct message when $name',
      ({ getDays, expectText }) => {
        const subscription = createMockSubscription({
          renewalDate: createRenewalDateOffset(getDays()),
        });
        render(<PlanCard subscription={subscription} />);
        expect(screen.getByText(expectText)).toBeInTheDocument();
      }
    );

    it.each(BILLING_FREQUENCY_SCENARIOS)(
      'should display billing frequency as "$expectedText" for $frequency',
      ({ frequency, expectedText }) => {
        const subscription = createMockSubscription({
          billingFrequency: frequency,
        });
        render(<PlanCard subscription={subscription} />);
        expect(screen.getByText(expectedText)).toBeInTheDocument();
      }
    );

    it('should render "Manage" button for paid subscriptions', () => {
      const subscription = SUBSCRIPTION_TEST_SCENARIOS.paidSubscription();
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
  });

  describe('rendering with trial subscription', () => {
    it('should display "Trial" badge for trial status', () => {
      const subscription = SUBSCRIPTION_TEST_SCENARIOS.trialSubscription(7);
      render(
        <PlanCard
          subscription={subscription}
          trialDaysRemaining={7}
        />
      );
      expect(screen.getByText('Trial')).toBeInTheDocument();
    });

    it.each(TRIAL_DAY_SCENARIOS)(
      'should handle trial with $label correctly',
      ({ days, expectSingular, expectWarning }) => {
        const subscription = SUBSCRIPTION_TEST_SCENARIOS.trialSubscription(days);
        render(
          <PlanCard
            subscription={subscription}
            trialDaysRemaining={days}
          />
        );

        if (expectSingular) {
          expect(screen.getByText(/1 day/)).toBeInTheDocument();
        } else {
          expect(screen.getByText(new RegExp(`${days} days`))).toBeInTheDocument();
        }

        if (expectWarning) {
          expect(screen.getByText(/Your trial expires soon/)).toBeInTheDocument();
        } else {
          expect(screen.queryByText(/Your trial expires soon/)).not.toBeInTheDocument();
        }
      }
    );

    it('should render "Choose Plan" button for trial subscriptions', () => {
      const subscription = SUBSCRIPTION_TEST_SCENARIOS.trialSubscription();
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
      const subscription = SUBSCRIPTION_TEST_SCENARIOS.trialSubscription();
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
    it('should have role="region" with aria-label for semantic structure', () => {
      const subscription = createMockSubscription();
      render(<PlanCard subscription={subscription} />);
      const card = screen.getByTestId('plan-card');
      expect(card).toHaveAttribute('role', 'region');
      expect(card).toHaveAttribute('aria-label');
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
    it.each(STATUS_BADGE_SCENARIOS)(
      'should render $expectedText badge with status=$status',
      ({ status, expectedText, testId }) => {
        const subscription = createMockSubscription({
          status,
        });
        render(<PlanCard subscription={subscription} />);
        expect(screen.getByTestId(testId)).toBeInTheDocument();
        expect(screen.getByText(expectedText)).toBeInTheDocument();
      }
    );
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
      const subscription = SUBSCRIPTION_TEST_SCENARIOS.paidSubscription();
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
