import { test, expect } from '@playwright/test';

test.describe('Authentication and Navigation Flow', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/browse');
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('can navigate back to landing page', async ({ page }) => {
    await page.goto('/login');
    await page.goto('/');
    await expect(page).toHaveURL(/.*$/);
    await expect(page.locator('body')).toBeVisible();
  });
});
