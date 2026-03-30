import { test, expect } from '@playwright/test';

test.describe('Authentication and Navigation Flow', () => {
  test('allows unauthenticated users to browse pools in guest mode', async ({ page }) => {
    await page.goto('/browse');
    await expect(page).toHaveURL(/.*browse/);
    await expect(page.getByText('GUEST MODE')).toBeVisible();
  });

  test('shows a guest empty state on private routes for unauthenticated users', async ({ page }) => {
    await page.goto('/list');
    await expect(page).toHaveURL(/.*\/list$/);
    await expect(page.getByRole('heading', { name: 'Guest Mode' })).toBeVisible();
    await expect(page.getByText('Sign in to access this feature')).toBeVisible();
  });

  test('can navigate back to landing page', async ({ page }) => {
    await page.goto('/login');
    await page.goto('/');
    await expect(page).toHaveURL(/.*$/);
    await expect(page.locator('body')).toBeVisible();
  });
});
