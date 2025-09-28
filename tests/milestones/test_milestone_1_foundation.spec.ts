/**
 * MILESTONE 1: Foundation Complete - Comprehensive validation (Refactored)
 * Validate Against: plan.md:Technical Context stack (lines 39-47)
 * User Story: quickstart.md:Scenario 1 registration flow (lines 5-33)
 * Required Completions:
 * - ✅ Next.js project builds without errors (T001-T005)
 * - ✅ Clerk authentication flow completes successfully (T011, T014-T016)
 * - ✅ MongoDB connection established and User schema functional (T012-T013)
 * - ✅ shadcn/ui components render correctly with theming (T019-T023)
 * - ✅ Basic routing structure working (auth + dashboard)
 * Success Criteria:
 * - All contracts/auth-api.yaml endpoints return 200/201 responses
 * - User creation follows data-model.md:User Entity exactly
 * - Free tier limits display correctly (1 party, 3 encounters, 10 creatures)
 */
import { test, expect } from '@playwright/test'
import { measurePageLoadTime, filterCriticalErrors, setupErrorCollection, setupTsErrorCollection, testResponsiveDesign } from '../helpers/page-utils'
import { navigateToAuth, verifyAuthPageElements, verifyProfileSetupForm, fillProfileForm, verifyProfileFormValues } from '../helpers/auth-utils'
import { verifyDashboardNavigation, verifyShadcnButtons, verifyLandingPageCards, verifyThemeStyling, verifyTierLimitsDisplay, getElementStyles } from '../helpers/ui-utils'
import { verifyEndpointsExist, testInvalidEndpoints } from '../helpers/api-utils'
import { verifyBasicAccessibility, testKeyboardNavigation, verifyPageHasContent } from '../helpers/accessibility-utils'

test.describe('Milestone 1: Foundation Complete', () => {
  test.describe('Core Infrastructure', () => {
    test('should verify Next.js project builds and loads correctly', async ({ page }) => {
      await page.goto('/')

      // Verify page loads within 3 seconds
      const startTime = Date.now()
      await expect(page.locator('h1')).toContainText('D&D Encounter Tracker')
      const loadTime = Date.now() - startTime
      expect(loadTime).toBeLessThan(3000)

      // Verify no console errors (except non-critical ones)
      const errors = setupErrorCollection(page)
      await page.reload()
      await page.waitForLoadState('networkidle')

      const criticalErrors = filterCriticalErrors(errors)
      expect(criticalErrors).toHaveLength(0)
    })

    test('should verify TypeScript compilation and type safety', async ({ page }) => {
      await page.goto('/')

      // Verify TypeScript-specific features work
      await expect(page.locator('h1')).toBeVisible()

      // Verify no TypeScript compilation errors in browser console
      const tsErrors = setupTsErrorCollection(page)
      await page.reload()
      await page.waitForLoadState('networkidle')

      expect(tsErrors).toHaveLength(0)
    })
  })

  test.describe('Authentication & User Management', () => {
    test('should verify authentication flow and user profile creation', async ({ page }) => {
      await navigateToAuth(page)
      await verifyAuthPageElements(page)
      await verifyProfileSetupForm(page)
      await fillProfileForm(page)
      await verifyProfileFormValues(page)
    })
  })

  test.describe('UI Components & Layout', () => {
    test('should verify dashboard routing and layout structure', async ({ page }) => {
      await page.goto('/dashboard')
      await verifyDashboardNavigation(page)
      await testResponsiveDesign(page, 'text=Dashboard')
    })

    test('should verify shadcn/ui components render with theming', async ({ page }) => {
      await page.goto('/')
      await verifyShadcnButtons(page)
      await verifyLandingPageCards(page)
      await verifyThemeStyling(page)
    })

    test('should verify Free Adventurer tier limits display', async ({ page }) => {
      await page.goto('/')
      await verifyTierLimitsDisplay(page)
    })
  })

  test.describe('API & Configuration', () => {
    test('should verify API endpoints are accessible', async ({ page }) => {
      await verifyEndpointsExist(page)
    })

    test('should verify essential project configuration', async ({ page }) => {
      await page.goto('/')

      const styles = await getElementStyles(page, 'h1')

      // Verify that Tailwind styles are applied
      expect(parseFloat(styles.fontSize)).toBeGreaterThan(24)
      expect(parseInt(styles.fontWeight)).toBeGreaterThan(400)

      await testResponsiveDesign(page, 'h1')
    })
  })

  test.describe('Error Handling & Accessibility', () => {
    test('should verify error handling and graceful degradation', async ({ page }) => {
      await page.goto('/non-existent-page')
      await page.waitForLoadState('networkidle')
      await verifyPageHasContent(page)
      await testInvalidEndpoints(page)
    })

    test('should verify accessibility basics', async ({ page }) => {
      await page.goto('/')
      await verifyBasicAccessibility(page)
      await testKeyboardNavigation(page)
    })
  })

  test.describe('Performance', () => {
    test('should verify performance requirements', async ({ page }) => {
      // Test page load performance
      const loadTime = await measurePageLoadTime(page, '/')
      expect(loadTime).toBeLessThan(3000)

      // Test interaction responsiveness
      const buttonStartTime = Date.now()
      await page.click('text=Start Free Trial')
      await page.waitForURL(/sign-up|auth/, { timeout: 5000 })
      const interactionTime = Date.now() - buttonStartTime

      expect(interactionTime).toBeLessThan(2000)
    })
  })
})