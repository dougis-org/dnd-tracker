/**
 * Usage Metric Schema Validation Tests
 *
 * Tests for UsageMetricSchema validation.
 * Validates usage tracking for subscription limits.
 */

import { UsageMetricSchema } from '../../../src/lib/schemas/subscriptionSchema';
import { createValidUsageMetric } from './schemaTestHelpers';

describe('UsageMetricSchema', () => {
  it('should validate a valid usage metric', () => {
    const validMetric = createValidUsageMetric();
    const result = UsageMetricSchema.safeParse(validMetric);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currentUsage).toBe(2);
    }
  });

  it('should validate a metric at max usage', () => {
    const maxMetric = createValidUsageMetric({
      metricName: 'encounters' as const,
      currentUsage: 50,
      maxAllowed: 50,
      category: 'encounter' as const,
    });
    const result = UsageMetricSchema.safeParse(maxMetric);
    expect(result.success).toBe(true);
  });

  it('should validate a metric with zero usage', () => {
    const zeroMetric = createValidUsageMetric({
      id: 'metric_characters',
      metricName: 'characters' as const,
      currentUsage: 0,
      maxAllowed: 50,
      category: 'character' as const,
    });
    const result = UsageMetricSchema.safeParse(zeroMetric);
    expect(result.success).toBe(true);
  });

  it('should reject metric with invalid metricName', () => {
    const invalidMetric = {
      ...createValidUsageMetric(),
      id: 'metric_invalid',
      metricName: 'invalidMetric' as string,
    };
    const result = UsageMetricSchema.safeParse(invalidMetric);
    expect(result.success).toBe(false);
  });

  it('should reject metric with negative usage', () => {
    const invalidMetric = createValidUsageMetric({ currentUsage: -1 });
    const result = UsageMetricSchema.safeParse(invalidMetric);
    expect(result.success).toBe(false);
  });
});
