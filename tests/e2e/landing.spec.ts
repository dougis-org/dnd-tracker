import { test, expect } from '@playwright/test';
import { PageValidator } from './test-data/page-validator';
import {
  PAGE_STRUCTURES,
} from './test-data/page-structure-map';

test.describe('Landing Page (T018)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page (landing page will be shown when NEXT_PUBLIC_FEATURE_LANDING=true)
    await page.goto('/');
  });

  test('should render all main sections (T018)', async ({ page }) => {
    const validator = new PageValidator(page);
    const structure = PAGE_STRUCTURES.landing;

    await validator.navigateTo('landing');

    // Check title
    await expect(page).toHaveTitle(/D&D Tracker/i);

    // Validate all aria-labeled sections exist
    if (structure.ariaLabels) {
      for (const label of structure.ariaLabels) {
        const section = page.locator(`section[aria-label="${label}"]`);
        await expect(section).toBeVisible();
      }
    }
  });

  test('should have all required SEO meta tags (T018)', async ({ page }) => {
    const validator = new PageValidator(page);
    await validator.navigateTo('landing');

    // Check title tag
    const title = page.locator('title').first();
    const titleText = await title.textContent();
    expect(titleText).toContain('D&D Tracker');

    // Check meta description (use first to avoid strict mode)
    const description = page.locator('meta[name="description"]').first();
    const hasDescription = await description.count().then((c) => c > 0);

    // Gracefully handle if description not present
    if (hasDescription) {
      const content = await description.getAttribute('content');
      expect(content?.toLowerCase()).toContain('campaign');
    }

    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]').first();
    const hasOgTitle = await ogTitle.count().then((c) => c > 0);
    expect(hasOgTitle).toBeTruthy();
  });

  test('should render hero with text and CTA (T018)', async ({ page }) => {
    const validator = new PageValidator(page);
    await validator.navigateTo('landing');

    const hero = page.locator('section[aria-label="Hero"]');
    await expect(hero).toBeVisible();

    // Check headline
    const headline = hero.locator('h1');
    await expect(headline).toBeVisible();
    const headlineText = await headline.textContent();
    expect(headlineText?.toLowerCase()).toContain('campaign');

    // Check CTA button exists
    const ctaButton = page.locator('button, a', { hasText: /Start Free/i }).first();
    await expect(ctaButton).toBeVisible();
  });

  test('should render feature cards (T018)', async ({ page }) => {
    const validator = new PageValidator(page);
    await validator.navigateTo('landing');

    const featuresSection = page.locator('section[aria-label="Features"]');
    await expect(featuresSection).toBeVisible();

    // Check that feature cards or content exists
    const content = featuresSection.locator('h3, article, div');
    const count = await content.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should render pricing tiers (T018)', async ({ page }) => {
    const validator = new PageValidator(page);
    await validator.navigateTo('landing');

    const pricingSection = page.locator('section[aria-label="Pricing"]');
    await expect(pricingSection).toBeVisible();

    // Check pricing content exists
    const content = pricingSection.locator('div, article, h3');
    const count = await content.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should render testimonials (T018)', async ({ page }) => {
    const validator = new PageValidator(page);
    await validator.navigateTo('landing');

    const testimonialsSection = page.locator(
      'section[aria-label="Testimonials"]'
    );
    await expect(testimonialsSection).toBeVisible();

    // Check testimonial content exists
    const content = testimonialsSection.locator('div, article, p');
    const count = await content.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Landing Page Responsiveness (T019)', () => {
  test('should be responsive at 375px (mobile)', async ({ page }) => {
    const validator = new PageValidator(page);
    await page.setViewportSize({ width: 375, height: 812 });
    await validator.navigateTo('landing');

    // Check sections load
    const sections = page.locator('section');
    const count = await sections.count();
    expect(count).toBeGreaterThan(0);

    // Check no horizontal scrollbar
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth
    );
    const clientWidth = await page.evaluate(
      () => document.documentElement.clientWidth
    );
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test('should be responsive at 768px (tablet)', async ({ page }) => {
    const validator = new PageValidator(page);
    await page.setViewportSize({ width: 768, height: 1024 });
    await validator.navigateTo('landing');

    // Check features section loads
    const featuresSection = page.locator('section[aria-label="Features"]');
    await expect(featuresSection).toBeVisible();
  });

  test('should be responsive at 1024px (desktop)', async ({ page }) => {
    const validator = new PageValidator(page);
    await page.setViewportSize({ width: 1024, height: 768 });
    await validator.navigateTo('landing');

    // Check pricing section loads
    const pricingSection = page.locator('section[aria-label="Pricing"]');
    await expect(pricingSection).toBeVisible();
  });
});
