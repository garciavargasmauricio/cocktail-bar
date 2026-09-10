import { test, expect } from '@playwright/test';

test.describe('Application Startup (Cocktail Bar)', () => {
  test('should load the home page and render key elements correctly', async ({ page }) => {
    // 1. Navigate to your local dev server
    await page.goto('http://localhost:4200/');

    // 2. Verify that the document title matches expected keywords
    await expect(page).toHaveTitle(/Cocktail/i);

    // 3. Verify that an essential UI element is visible (e.g., search input)
    const searchInput = page.locator('input[formControlName="query"], input[type="search"], input');
    await expect(searchInput.first()).toBeVisible();
  });
});
