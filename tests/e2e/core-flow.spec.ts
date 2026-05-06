import { test, expect } from '@playwright/test';

test.describe('SubPool Core Flows', () => {
  test('should load the homepage and browse pools', async ({ page }) => {
    // Navigate to landing
    await page.goto('/');
    
    // Check for main CTA
    const cta = page.getByRole('button', { name: /start browsing/i });
    await expect(cta).toBeVisible();
    
    // Click to browse
    await cta.click();
    
    // Should be on browse page
    await expect(page).toHaveURL(/.*browse/);
    
    // Check if pools are loaded (assuming at least one exists or mock is active)
    const poolCards = page.locator('.pool-card-hover');
    await expect(poolCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('should search for a platform', async ({ page }) => {
    await page.goto('/browse');
    
    const searchInput = page.getByPlaceholder(/search protocols/i);
    await searchInput.fill('Netflix');
    
    // Results should filter
    const netflixPools = page.locator('text=Netflix');
    await expect(netflixPools.first()).toBeVisible();
  });

  test('should navigate to dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for "TODAY COMMAND CENTER"
    await expect(page.getByText(/TODAY COMMAND CENTER/i)).toBeVisible();
    
    // Check for stat cards
    await expect(page.getByText(/POOLS OWNED/i)).toBeVisible();
  });
});
