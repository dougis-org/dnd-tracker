import { test, expect } from '@playwright/test';

test.describe('Landing Page (T018)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page (landing page will be shown when NEXT_PUBLIC_FEATURE_LANDING=true)
    await page.goto('/');
  });

  test('should render all main sections (T018)', async ({ page }) => {
    await page.goto('/');

    // Check title exists
    await expect(page).toHaveTitle(/D&D Tracker/i);

    // Check hero section
    const heroSection = page.locator('section[aria-label="Hero section"]');
    await expect(heroSection).toBeVisible();

    // Check features section
    const featuresSection = page.locator('section[aria-label="Features"]');
    await expect(featuresSection).toBeVisible();

    // Check interactive demo section
    const demoSection = page.locator('section[aria-label="Interactive Demo"]');
    await expect(demoSection).toBeVisible();

    // Check testimonials section
    const testimonials = page.locator('section[aria-label="Testimonials"]');
    await expect(testimonials).toBeVisible();

    // Check pricing section
    const pricing = page.locator('section[aria-label="Pricing"]');
    await expect(pricing).toBeVisible();
  });

  test('should have all required SEO meta tags (T018)', async ({ page }) => {
    // Check title tag (get first one to avoid strict mode with multiple titles in DOM)
    const title = page.locator('title').first();
    const titleText = await title.textContent();
    expect(titleText).toContain('D&D Tracker');

    // Check meta description (use first to avoid strict mode)
    const description = page.locator('meta[name="description"]').first();
    await expect(description).toHaveAttribute(
      'content',
      /Organize campaigns, manage characters/i
    );

    // Check canonical link
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /localhost(:\d+)?\//);
    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /D&D Tracker/i);

    const ogDescription = page.locator('meta[property="og:description"]');
    await expect(ogDescription).toHaveAttribute(
      'content',
      /Campaign Management/i
    );

    // Check Twitter card
    const twitterCard = page.locator('meta[name="twitter:card"]');
    await expect(twitterCard).toHaveAttribute('content', 'summary_large_image');
  });

  test('should render hero with text and CTA (T018)', async ({ page }) => {
    await page.goto('/');

    const hero = page.locator('section[aria-label="Hero section"]');

    // Check headline
    const headline = hero.locator('h1');
    await expect(headline).toContainText(/Master Your Campaigns/i);

    // Check subheading
    const subheading = hero.locator('p').first();
    await expect(subheading).toContainText(
      /D&D Tracker brings all your campaign/i
    );

    // Check CTA button
    const ctaButton = hero.locator('a', { hasText: /Start Free/i });
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toHaveAttribute('href', '/sign-up');
  });

  test('should render feature cards (T018)', async ({ page }) => {
    await page.goto('/');

    const featuresSection = page.locator('section[aria-label="Features"]');

    // Check that feature cards exist
    const featureCards = featuresSection.locator('article');
    const count = await featureCards.count();
    expect(count).toBeGreaterThan(0);

    // Check first feature card content
    const firstCard = featureCards.first();
    await expect(firstCard.locator('h3')).toBeVisible();
    await expect(firstCard.locator('p')).toBeVisible();
  });

  test('should render pricing tiers (T018)', async ({ page }) => {
    await page.goto('/');

    const pricingSection = page.locator('section[aria-label="Pricing"]');

    // Check pricing tiers are visible
    const pricingCards = pricingSection
      .locator('div')
      .filter({ has: page.locator('text=/\\$\\d+/') });
    const count = await pricingCards.count();
    expect(count).toBeGreaterThan(0);

    // Check Get Started buttons
    const getStartedButtons = pricingSection.locator('button', {
      hasText: /Get Started/i,
    });
    const btnCount = await getStartedButtons.count();
    expect(btnCount).toBeGreaterThan(0);
  });

  test('should render testimonials (T018)', async ({ page }) => {
    await page.goto('/');

    const testimonialsSection = page.locator(
      'section[aria-label="Testimonials"]'
    );

    // Check testimonial cards
    const testimonialCards = testimonialsSection.locator('div[class*="p-6"]');
    const count = await testimonialCards.count();
    expect(count).toBeGreaterThan(0);

    // Check for star ratings (use first to avoid strict mode)
    const stars = testimonialsSection.locator('text=/★/').first();
    await expect(stars).toBeVisible();
  });
});

test.describe('Landing Page Responsiveness (T019)', () => {
  test('should be responsive at 375px (mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    // Check all sections load
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
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // Check tablet layout adjustments
    const featuresSection = page.locator('section[aria-label="Features"]');
    await expect(featuresSection).toBeVisible();

    // Feature cards should be visible
    const featureCards = featuresSection.locator('article');
    const count = await featureCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should be responsive at 1024px (desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');

    // Check desktop layout
    const pricingSection = page.locator('section[aria-label="Pricing"]');
    await expect(pricingSection).toBeVisible();

    // Pricing should show multiple columns
    const pricingItems = pricingSection.locator('div[class*="grid"]');
    await expect(pricingItems).toBeVisible();
  });
});
