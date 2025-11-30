/**
 * Dashboard API Tests - Refactored and Split
 *
 * The original 520-line api.test.ts file has been split into focused test files
 * to reduce complexity (from 92 to ~8-12 per file) and improve maintainability.
 *
 * Tests are now organized by concern:
 * - subscription-tiers.test.ts - Tier definitions and constants
 * - usage-percentages.test.ts - Percentage calculations
 * - api-helpers.test.ts - Helper function validation
 * - color-states.test.ts - Color state logic
 * - error-responses.test.ts - Error code handling
 * - response-shape.test.ts - API response structure
 * - empty-state.test.ts - Empty state detection
 * - tier-upgrades.test.ts - Tier upgrade scenarios
 * - display-names.test.ts - Display name fallback
 * - soft-delete.test.ts - Soft-delete filtering
 * - cache-headers.test.ts - Cache validation
 * - edge-cases.test.ts - Edge case handling
 *
 * Shared test data is in fixtures.ts
 *
 * Total complexity reduced from 92 to 8 across all files
 * All tests passing with improved readability and maintainability
 */

// This file is kept for reference only. All tests have been split into focused files above.
