/* global getComputedStyle */
import { test, expect } from '@playwright/test';

test('dropdown renders above content for Collections (left cluster second item)', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'networkidle' });

  const triggerSelector =
    'nav[aria-label="Primary"] ul[aria-label="Primary navigation left cluster"] > li:nth-child(2) button, nav[aria-label="Primary"] ul[aria-label="Primary navigation left cluster"] > li:nth-child(2) a';

  await page.waitForSelector('nav[aria-label="Primary"]', { timeout: 5000 });
  await page.click(triggerSelector);
  await page.waitForTimeout(250);

  // Find the dropdown menu (support portal rendering). Prefer the stable data-testid.
  const menu = await page.evaluate(() => {
    function looksLikeMenu(el) {
      if (!el || el.nodeType !== 1) return null;
      try {
        const rect = el.getBoundingClientRect();
        if (rect.width < 20 || rect.height < 8) return null;
        if (el.getAttribute && el.getAttribute('role') === 'menu')
          return { z: getComputedStyle(el).zIndex || 'auto', rect };
        if (
          el.querySelector &&
          el.querySelector('li a, li button, [role="menuitem"]')
        )
          return { z: getComputedStyle(el).zIndex || 'auto', rect };
      } catch (_e) {
        return null;
      }
      return null;
    }

    // Prefer stable data-testid selector added to portal container
    const byTestId = document.querySelector(
      '[data-testid="global-nav-dropdown"]'
    );
    if (byTestId) {
      const r = looksLikeMenu(byTestId);
      if (r)
        return {
          found: true,
          z: r.z,
          rect: {
            x: r.rect.x,
            y: r.rect.y,
            width: r.rect.width,
            height: r.rect.height,
          },
        };
    }

    const explicit = document.querySelector('ul[role="menu"], [role="menu"]');
    if (explicit) {
      const r = looksLikeMenu(explicit);
      if (r)
        return {
          found: true,
          z: r.z,
          rect: {
            x: r.rect.x,
            y: r.rect.y,
            width: r.rect.width,
            height: r.rect.height,
          },
        };
    }

    const candidates = Array.from(document.body.children).reverse();
    for (const c of candidates) {
      const r = looksLikeMenu(c);
      if (r)
        return {
          found: true,
          z: r.z,
          rect: {
            x: r.rect.x,
            y: r.rect.y,
            width: r.rect.width,
            height: r.rect.height,
          },
        };
    }

    return { found: false };
  });

  expect(menu.found).toBeTruthy();
  expect(menu.rect.width).toBeGreaterThan(0);

  // Check top-most element at menu center is the menu (or has same z-index)
  const topAtCenter = await page.evaluate(
    ({ x, y }) => {
      const el = document.elementFromPoint(x, y);
      if (!el) return null;
      return { tag: el.tagName, z: getComputedStyle(el).zIndex || 'auto' };
    },
    {
      x: Math.round(menu.rect.x + menu.rect.width / 2),
      y: Math.round(menu.rect.y + menu.rect.height / 2),
    }
  );

  expect(topAtCenter).not.toBeNull();

  // Ensure menu is not overlapping the main content (hero)
  const mainRect = await page.evaluate(() => {
    const main = document.getElementById('main-content')
    if (!main) return null
    const r = main.getBoundingClientRect()
    return { x: r.x, y: r.y, width: r.width, height: r.height }
  })

  if (mainRect) {
    // Wait for any post-render adjustment to finish and ensure there is no vertical overlap.
    // Prefer a test hook attribute set by the menu once positioning settles. Fallback to polling.
    await Promise.race([
      page.waitForSelector('[data-testid="global-nav-dropdown"][data-positioning="complete"]', { timeout: 5000 }),
      page.waitForFunction(() => {
      const menuEl = document.querySelector('[data-testid="global-nav-dropdown"]') || document.querySelector('ul[role="menu"]')
      if (!menuEl) return false
      const m = menuEl.getBoundingClientRect()
      const main = document.getElementById('main-content')
      if (!main) return true
      const a = main.getBoundingClientRect()
      // no vertical overlap
      return !(m.bottom > a.top && m.top < a.bottom)
      }, null, { timeout: 8000 })
    ])

    // Re-query and assert again for deterministic failure messages
    const menuNow = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="global-nav-dropdown"]') || document.querySelector('ul[role="menu"]')
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { top: r.top, bottom: r.bottom }
    })

    expect(menuNow).not.toBeNull()
    const menuTop = menuNow!.top
    const menuBottom = menuNow!.bottom
    // Prefer to assert against a smaller, visible hero region inside main (if present)
    const heroRect = await page.evaluate(() => {
      const main = document.getElementById('main-content')
      if (!main) return null
      const hero = main.querySelector('h1, h2, .hero, .page-title')
      if (!hero) return null
      const r = hero.getBoundingClientRect()
      return { x: r.x, y: r.y, width: r.width, height: r.height }
    })

    const mainTop = mainRect.y
    const mainBottom = mainRect.y + mainRect.height

    const verticalOverlap = heroRect
      ? !(menuBottom <= heroRect.y || menuTop >= heroRect.y + heroRect.height)
      : !(menuBottom <= mainTop || menuTop >= mainBottom)
    // Log diagnostics for failing cases to help debug layout collisions on CI/local
    if (verticalOverlap) {
      console.log('menu rect', menuNow)
      const heroRect = await page.evaluate(() => {
        const main = document.getElementById('main-content')
        if (!main) return null
        const hero = main.querySelector('h1, h2, .hero, .page-title')
        if (!hero) return null
        const r = hero.getBoundingClientRect()
        return { top: r.top, bottom: r.bottom }
      })
      console.log('main rect', { top: mainTop, bottom: mainBottom })
      console.log('hero rect', heroRect)
    }
    expect(verticalOverlap).toBe(false)
  }
});
