/**
 * Usage Metric Schema Validation Tests
 *
 * Tests for UsageMetricSchema validation.
 * Validates usage tracking for subscription limits.
 */

import { UsageMetricSchema } from '../../../src/lib/schemas/subscriptionSchema';

describe('UsageMetricSchema', () => {
  it('should validate a valid usage metric', () => {
    const validMetric = {
      id: 'metric_parties',
      userId: 'user-123',
      metricName: 'parties' as const,
      currentUsage: 2,
      maxAllowed: 5,
      category: 'party' as const,
      updatedAt: new Date(),
    };

    const result = UsageMetricSchema.safeParse(validMetric);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currentUsage).toBe(2);
    }
  });

  it('should validate a metric at max usage', () => {
    const maxMetric = {
      id: 'metric_parties',
      userId: 'user-123',
      metricName: 'encounters' as const,
      currentUsage: 50,
      maxAllowed: 50,
      category: 'encounter' as const,
      updatedAt: new Date(),
    };

    const result = UsageMetricSchema.safeParse(maxMetric);
    expect(result.success).toBe(true);
  });

  it('should validate a metric with zero usage', () => {
    const zeroMetric = {
      id: 'metric_characters',
      userId: 'user-123',
      metricName: 'characters' as const,
      currentUsage: 0,
      maxAllowed: 50,
      category: 'character' as const,
      updatedAt: new Date(),
    };

    const result = UsageMetricSchema.safeParse(zeroMetric);
    expect(result.success).toBe(true);
  });

  it('should reject metric with invalid metricName', () => {
    const invalidMetric = {
      id: 'metric_invalid',
      userId: 'user-123',
      metricName: 'invalidMetric',
      currentUsage: 2,
      maxAllowed: 5,
      category: 'party' as const,
      updatedAt: new Date(),
    };

    const result = UsageMetricSchema.safeParse(invalidMetric);
    expect(result.success).toBe(false);
  });

  it('should reject metric with negative usage', () => {
    const invalidMetric = {
      id: 'metric_parties',
      userId: 'user-123',
      metricName: 'parties' as const,
      currentUsage: -1,
      maxAllowed: 5,
      category: 'party' as const,
      updatedAt: new Date(),
    };

    const result = UsageMetricSchema.safeParse(invalidMetric);
    expect(result.success).toBe(false);
  });
});
