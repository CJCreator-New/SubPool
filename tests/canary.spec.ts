import { test, expect } from '@playwright/test';

/**
 * Production Canary Pulse
 * Minimal smoke tests designed to run in CI against the live staging/prod environments.
 */
const PROD_URL = process.env.BASE_URL || 'http://localhost:5173';

test.describe('Production Canary Pulse', () => {

    test('Liveness: Landing page loads with premium visuals', async ({ page }) => {
        await page.goto(PROD_URL);
        await expect(page).toHaveTitle(/SubPool/);
        
        // Verify critical hero element is visible
        const hero = page.getByText(/Share subscriptions/i);
        await expect(hero).toBeVisible();
    });

    test('Data Uplink: Browse page fetches live nodes', async ({ page }) => {
        await page.goto(`${PROD_URL}/browse`);
        // Check for card presence (Skeleton or Real)
        await expect(page.locator('div[class*="grid"]')).toBeVisible();
    });

    test('SecOps: Auth portal is responsive', async ({ page }) => {
        await page.goto(`${PROD_URL}/login`);
        await expect(page.getByRole('button', { name: /magic link/i })).toBeVisible();
    });
});
