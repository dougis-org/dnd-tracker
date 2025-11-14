/**
 * Pagination helper for mock fixtures
 */

import type { Invoice, PaginatedInvoices } from '../../src/lib/schemas/subscriptionSchema';

export function createPaginationResponse(
  invoices: Invoice[],
  page: number,
  pageSize: number,
  totalCount?: number
): PaginatedInvoices {
  const finalTotalCount = totalCount ?? invoices.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedInvoices = invoices.slice(startIndex, endIndex);
  const hasNextPage = endIndex < finalTotalCount;

  return {
    invoices: paginatedInvoices,
    totalCount: finalTotalCount,
    pageSize,
    currentPage: page,
    hasNextPage,
  };
}
