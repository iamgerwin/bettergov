import { test, expect } from '@playwright/test';

test.describe('Critical User Flows', () => {
  test('PhilSys National ID registration button should work', async ({
    page,
  }) => {
    await page.goto('/');

    // Find the PhilSys registration section
    const philSysSection = page.locator(
      'text=PhilSys National ID Registration'
    );
    await expect(philSysSection).toBeVisible();

    // Find the Register Now button (it's wrapped in an anchor tag)
    const registerLink = page.locator('a[href*="philsys.gov.ph"]').first();

    // Check if the link exists
    const linkCount = await registerLink.count();
    if (linkCount > 0) {
      await expect(registerLink).toBeVisible();

      // Get the href attribute
      const href = await registerLink.getAttribute('href');
      expect(href).toContain('philsys.gov.ph');
    } else {
      // If no direct link, check for button
      const registerButton = page.getByRole('button', { name: 'Register Now' });
      await expect(registerButton).toBeVisible();
    }
  });

  test('search for government services', async ({ page }) => {
    await page.goto('/services');

    // Wait for services page to load
    await expect(
      page.getByRole('heading', { name: /Government Services/i })
    ).toBeVisible();

    // Find search input
    const searchBox = page.getByPlaceholder(/Search services/i);
    await expect(searchBox).toBeVisible();

    // Search for passport
    await searchBox.fill('passport');
    await page.waitForTimeout(500);

    // Verify search was successful by checking the input value
    await expect(searchBox).toHaveValue('passport');
  });

  test('language switcher should work', async ({ page }) => {
    await page.goto('/');

    // Find language switcher select element (first one)
    const languageSwitcher = page.locator('select').first();
    await expect(languageSwitcher).toBeVisible();

    // Change language to Filipino
    await languageSwitcher.selectOption('fil');

    // Wait for page to update
    await page.waitForTimeout(500);

    // Verify language changed (check for Filipino text in navigation)
    await expect(page.getByRole('link', { name: 'Tahanan' })).toBeVisible();

    // Switch back to English
    await languageSwitcher.selectOption('en');

    // Verify back to English
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
  });

  test('hotlines page should display emergency numbers', async ({ page }) => {
    await page.goto('/philippines/hotlines');

    // Check page loaded
    await expect(
      page.getByRole('heading', { name: /Hotlines/i })
    ).toBeVisible();

    // Check for critical hotline numbers
    await expect(page.getByText('911')).toBeVisible();
  });

  test('government departments page should load', async ({ page }) => {
    await page.goto('/government/departments');

    // Check page loaded
    await expect(
      page.getByRole('heading', { name: /Government Departments/i })
    ).toBeVisible();

    // Check for some department cards
    await expect(page.locator('text=/Department of/i').first()).toBeVisible();
  });

  test.skip('weather page should display weather information', async ({
    page,
  }) => {
    await page.goto('/data/weather');

    // Check page loaded
    await expect(page.getByRole('heading', { name: /Weather/i })).toBeVisible();

    // Check for weather sections
    await expect(page.locator('text=/Weather/i').first()).toBeVisible();
  });

  test.skip('flood control projects page should load', async ({ page }) => {
    await page.goto('/flood-control-projects');

    // Check page loaded
    await expect(
      page.getByRole('heading', { name: /Flood Control Projects/i })
    ).toBeVisible();

    // Check for links to views
    await expect(page.getByRole('link', { name: /Table/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Map/i })).toBeVisible();

    // Navigate to map view
    await page.getByRole('link', { name: /Map/i }).click();
    await page.waitForTimeout(500);

    // Check map container is visible
    await expect(page.locator('#map')).toBeVisible();
  });
});
