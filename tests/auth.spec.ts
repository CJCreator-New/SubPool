import { test, expect } from '@playwright/test';

test.describe('Authentication and Navigation Flow', () => {
  test('allows unauthenticated users to browse pools in guest mode', async ({ page }) => {
    await page.goto('/browse');
    await expect(page).toHaveURL(/.*browse/);
    await expect(page.getByText('Guest mode')).toBeVisible();
  });

  test('redirects unauthenticated users from private routes to login with return path', async ({ page }) => {
    await page.goto('/list');
    await expect(page).toHaveURL(/.*login\?next=%2Flist/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('can navigate back to landing page', async ({ page }) => {
    await page.goto('/login');
    await page.goto('/');
    await expect(page).toHaveURL(/.*$/);
    await expect(page.locator('body')).toBeVisible();
  });
});
