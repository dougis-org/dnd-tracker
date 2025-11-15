/**
 * Invoice Schema Validation Tests
 *
 * Tests for InvoiceSchema and PaginatedInvoicesSchema validation.
 * Validates billing history and invoice data structures.
 */

import {
  InvoiceSchema,
  PaginatedInvoicesSchema,
} from '../../../src/lib/schemas/subscriptionSchema';

describe('InvoiceSchema', () => {
  it('should validate a valid invoice', () => {
    const validInvoice = {
      id: 'inv_001',
      userId: 'user-123',
      date: new Date('2025-10-13'),
      description: 'Seasoned Adventurer - Annual Subscription',
      amount: 99.99,
      currency: 'USD',
      status: 'Paid' as const,
      taxAmount: 7.5,
      taxRate: 0.08,
      downloadUrl: 'https://example.com/invoices/inv_001.pdf',
    };

    const result = InvoiceSchema.safeParse(validInvoice);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amount).toBe(99.99);
      expect(result.data.status).toBe('Paid');
    }
  });

  it('should validate invoice with default currency', () => {
    const invoice = {
      id: 'inv_002',
      userId: 'user-123',
      date: new Date(),
      description: 'Subscription charge',
      amount: 50,
      status: 'Pending' as const,
    };

    const result = InvoiceSchema.safeParse(invoice);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBe('USD');
    }
  });

  it('should reject invoice with invalid currency code', () => {
    const invalidInvoice = {
      id: 'inv_invalid',
      userId: 'user-123',
      date: new Date(),
      description: 'Invoice',
      amount: 50,
      currency: 'INVALID',
      status: 'Paid' as const,
    };

    const result = InvoiceSchema.safeParse(invalidInvoice);
    expect(result.success).toBe(false);
  });

  it('should reject invoice with invalid status', () => {
    const invalidInvoice = {
      id: 'inv_invalid',
      userId: 'user-123',
      date: new Date(),
      description: 'Invoice',
      amount: 50,
      status: 'Processing',
    };

    const result = InvoiceSchema.safeParse(invalidInvoice);
    expect(result.success).toBe(false);
  });

  it('should reject invoice with negative amount', () => {
    const invalidInvoice = {
      id: 'inv_invalid',
      userId: 'user-123',
      date: new Date(),
      description: 'Invoice',
      amount: -50,
      status: 'Paid' as const,
    };

    const result = InvoiceSchema.safeParse(invalidInvoice);
    expect(result.success).toBe(false);
  });

  it('should reject invoice with taxRate > 1', () => {
    const invalidInvoice = {
      id: 'inv_invalid',
      userId: 'user-123',
      date: new Date(),
      description: 'Invoice',
      amount: 50,
      status: 'Paid' as const,
      taxRate: 1.5,
    };

    const result = InvoiceSchema.safeParse(invalidInvoice);
    expect(result.success).toBe(false);
  });

  it('should reject invoice with invalid URL', () => {
    const invalidInvoice = {
      id: 'inv_invalid',
      userId: 'user-123',
      date: new Date(),
      description: 'Invoice',
      amount: 50,
      status: 'Paid' as const,
      downloadUrl: 'not-a-url',
    };

    const result = InvoiceSchema.safeParse(invalidInvoice);
    expect(result.success).toBe(false);
  });
});

describe('PaginatedInvoicesSchema', () => {
  it('should validate a valid paginated response', () => {
    const validResponse = {
      invoices: [
        {
          id: 'inv_001',
          userId: 'user-123',
          date: new Date(),
          description: 'Invoice 1',
          amount: 99.99,
          status: 'Paid' as const,
        },
      ],
      totalCount: 5,
      pageSize: 10,
      currentPage: 1,
      hasNextPage: false,
    };

    const result = PaginatedInvoicesSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.invoices.length).toBe(1);
      expect(result.data.totalCount).toBe(5);
    }
  });

  it('should validate empty invoice list', () => {
    const emptyResponse = {
      invoices: [],
      totalCount: 0,
      pageSize: 10,
      currentPage: 1,
      hasNextPage: false,
    };

    const result = PaginatedInvoicesSchema.safeParse(emptyResponse);
    expect(result.success).toBe(true);
  });

  it('should reject response with invalid pageSize', () => {
    const invalidResponse = {
      invoices: [],
      totalCount: 0,
      pageSize: 0,
      currentPage: 1,
    };

    const result = PaginatedInvoicesSchema.safeParse(invalidResponse);
    expect(result.success).toBe(false);
  });

  it('should reject response with invalid currentPage', () => {
    const invalidResponse = {
      invoices: [],
      totalCount: 0,
      pageSize: 10,
      currentPage: 0,
    };

    const result = PaginatedInvoicesSchema.safeParse(invalidResponse);
    expect(result.success).toBe(false);
  });
});
