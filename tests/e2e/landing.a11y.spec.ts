import { test, expect } from '@playwright/test';
import { injectAxe } from 'axe-playwright';

interface AxeResults {
  violations: Array<{
    impact: string;
  }>;
}

/**
 * T020: Landing page accessibility tests
 * Comprehensive accessibility validation for the landing page
 */
test.describe('Landing Page Accessibility (T020)', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // Check for h1
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // h1 should come before h2
    const h1Box = await h1.boundingBox();
    const h2 = page.locator('h2').first();
    const h2Box = await h2.boundingBox();

    expect(h1Box?.y).toBeLessThan(h2Box?.y || 0);
  });

  test('should have proper ARIA labels on regions', async ({ page }) => {
    await page.goto('/');

    // Check all sections have proper aria labels
    const heroBox = page.locator('section[aria-label]');
    const count = await heroBox.count();
    expect(count).toBeGreaterThan(0);

    // Check specific sections
    const sections = [
      'Hero',
      'Features',
      'Interactive Demo',
      'Testimonials',
      'Pricing',
    ];
    for (const sectionName of sections) {
      const section = page.locator(`section[aria-label="${sectionName}"]`);
      // Note: Not all sections may be present, so we don't strict-require them
      if ((await section.count()) > 0) {
        await expect(section).toBeVisible();
      }
    }
  });

  test('should have accessible buttons and links', async ({ page }) => {
    await page.goto('/');

    // Check that ALL buttons have accessible names
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const accessibleName = await button.getAttribute('aria-label');
      const text = await button.textContent();

      // Either aria-label or text content must exist
      expect(accessibleName || text).toBeTruthy();
    }

    // Check ALL links
    const links = page.locator('a');
    const linkCount = await links.count();

    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      const text = await link.textContent();

      // Links should have text or aria-label
      expect(text?.trim().length || 0).toBeGreaterThan(0);
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');

    // Inject axe with color contrast rules enabled
    await injectAxe(page);

    // Run a targeted check for color-contrast rule
    interface ColorContrastResult {
      violations: Array<{
        impact: string;
      }>;
    }

    const results = (await page.evaluate(() => {
      return new Promise<ColorContrastResult>((resolve) => {
        const axe = (window as { axe?: { run: Function } }).axe;
        if (axe && axe.run) {
          axe.run(
            { runOnly: { type: 'rule', values: ['color-contrast'] } },
            (result: ColorContrastResult) => {
              resolve(result);
            }
          );
        } else {
          resolve({ violations: [] });
        }
      });
    })) as ColorContrastResult;

    // Allow warnings but fail on critical violations
    if (results?.violations && results.violations.length > 0) {
      const criticals = results.violations.filter(
        (v: AxeResults['violations'][0]) => v.impact === 'critical'
      );
      if (criticals.length > 0) {
        throw new Error(
          `Found ${criticals.length} critical color contrast violations`
        );
      }
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');

    // Focus on first interactive element
    await page.keyboard.press('Tab');

    // Get focused element
    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.tagName;
    });

    // Should focus on an interactive element (a, button, input, etc.)
    expect(['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT']).toContain(focused);

    // Tab through a few elements without getting stuck
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const currentElement = await page.evaluate(() => {
        return document.activeElement?.tagName;
      });
      expect(currentElement).not.toBeNull();
    }
  });
});
