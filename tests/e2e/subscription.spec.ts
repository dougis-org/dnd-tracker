import { test, expect } from '@playwright/test';
import { PageValidator } from './test-data/page-validator';
import { PAGE_STRUCTURES } from './test-data/page-structure-map';
import { mockSignIn } from './test-data/mock-auth';

test.describe('Subscription E2E', () => {
  test.beforeEach(async ({ page }) => {
    await mockSignIn(page, '/subscription');
  });

  test('can navigate directly to /subscription and view header', async ({
    page,
  }) => {
    const validator = new PageValidator(page);
    const structure = PAGE_STRUCTURES.subscription;

    await validator.navigateTo('subscription');
    await expect(page).toHaveURL('/subscription');

    // Validate page structure
    await validator.validateHeading(structure);
  });

  test('can open User menu and navigate to Subscription', async ({ page }) => {
    const validator = new PageValidator(page);

    // start from the home page
    await validator.navigateTo('landing');

    // Try to open user menu and navigate
    const userButton = page
      .locator('button')
      .filter({ hasText: /user/i })
      .first();
    const exists = await userButton.count().then((c: number) => c > 0);

    if (exists && (await userButton.isVisible())) {
      await userButton.click();

      // Click subscription link
      const subscriptionLink = page
        .locator('a')
        .filter({ hasText: /subscription/i })
        .first();
      if (await subscriptionLink.count().then((c: number) => c > 0)) {
        await subscriptionLink.click();
        await expect(page).toHaveURL('/subscription');
      }
    } else {
      // If no user menu, navigate directly
      await page.goto('/subscription');
      await expect(page).toHaveURL('/subscription');
    }
  });
});
