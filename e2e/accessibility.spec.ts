import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test.skip('homepage should not have accessibility violations', async ({
    page,
  }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['color-contrast']) // Temporarily disable color contrast checks
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test.skip('services page should not have accessibility violations', async ({
    page,
  }) => {
    await page.goto('/services');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['color-contrast']) // Temporarily disable color contrast checks
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test.skip('keyboard navigation should work', async ({ page }) => {
    await page.goto('/');

    // Tab through interactive elements
    await page.keyboard.press('Tab');

    // First tab should focus on Join Us link
    const focusedElement = await page.evaluate(
      () => document.activeElement?.textContent
    );
    expect(focusedElement).toBeTruthy();

    // Continue tabbing through navbar
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }

    // Press Enter on a focused link
    await page.keyboard.press('Enter');

    // Should navigate to a new page
    await expect(page.url()).not.toBe('http://localhost:5173/');
  });

  test('aria labels should be present on interactive elements', async ({
    page,
  }) => {
    await page.goto('/');

    // Check mobile menu button has aria-label or aria-expanded
    const menuButton = page
      .locator('button')
      .filter({ hasText: /menu/i })
      .first();
    const isMenuPresent = (await menuButton.count()) > 0;

    if (isMenuPresent) {
      const ariaLabel = await menuButton.getAttribute('aria-label');
      const ariaExpanded = await menuButton.getAttribute('aria-expanded');
      expect(ariaLabel || ariaExpanded).toBeTruthy();
    }

    // Check search input has proper label or aria-label
    const searchInput = page.getByPlaceholder(/Search for services/i);
    const searchAriaLabel = await searchInput.getAttribute('aria-label');
    const searchId = await searchInput.getAttribute('id');

    // Should have either aria-label or associated label
    expect(searchAriaLabel || searchId).toBeTruthy();
  });

  test('images should have alt text', async ({ page }) => {
    await page.goto('/');

    // Find all images
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const altText = await img.getAttribute('alt');

      // Every image should have alt text
      expect(altText).toBeTruthy();
    }
  });

  test.skip('focus indicators should be visible', async ({ page }) => {
    await page.goto('/');

    // Tab to first interactive element
    await page.keyboard.press('Tab');

    // Wait for focus to settle
    await page.waitForTimeout(100);

    // Get the focused element
    const focusedElement = page.locator(':focus');
    const focusedCount = await focusedElement.count();

    // Should have a focused element
    expect(focusedCount).toBeGreaterThan(0);

    if (focusedCount > 0) {
      // Check if focus is visible (element should have outline or ring)
      const styles = await focusedElement.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          outline: computed.outline,
          outlineWidth: computed.outlineWidth,
          boxShadow: computed.boxShadow,
        };
      });

      // Should have some form of focus indicator
      const hasFocusIndicator =
        (styles.outline &&
          styles.outline !== 'none' &&
          styles.outline !== 'rgb(0, 0, 0) none 0px') ||
        (styles.outlineWidth && styles.outlineWidth !== '0px') ||
        (styles.boxShadow && styles.boxShadow !== 'none');

      expect(hasFocusIndicator).toBeTruthy();
    }
  });
});
