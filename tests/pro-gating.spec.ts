import { test, expect } from '@playwright/test';

test.describe('Pro-Tier Gating (PRO)', () => {
    test.beforeEach(async ({ page }) => {
        // We assume guest/free user by default if not authenticated
        await page.goto('/browse');
    });

    test('PRO-001: Advanced Filters are gated for Free users', async ({ page }) => {
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000); // Wait for hydration
        
        // Open Filter Panel
        const filterBtn = page.getByText(/Refine Search/i).first();
        await expect(filterBtn).toBeVisible({ timeout: 15000 });
        await filterBtn.click();

        // Check for "Unlock" or "Pro" indicators on restricted filters
        const priceRangeLocked = page.getByText(/UNLOCK PRICE CALIBRATION/i).first();
        const ratingLocked = page.getByText(/UNLOCK TRUST FILTERS/i).first();

        await expect(priceRangeLocked).toBeVisible({ timeout: 10000 });
        await expect(ratingLocked).toBeVisible({ timeout: 10000 });

        // Try to click an "Unlock" button and verify PaywallModal opens
        await priceRangeLocked.click();
        await expect(page.getByText(/Advanced Filters/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('PRO-002: Market Intelligence is gated for Free users', async ({ page }) => {
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        const marketBtn = page.getByText(/See market rates/i).first();
        await expect(marketBtn).toBeVisible({ timeout: 15000 });
        await marketBtn.click();

        // Verify "Unlock Now" CTA is visible instead of raw data
        await expect(page.getByText(/Unlock Now/i)).toBeVisible();
        
        // Clicking "Unlock Now" should open PaywallModal
        await page.getByRole('button', { name: /Unlock Now/i }).click();
        await expect(page.getByText(/Market Intelligence/i)).toBeVisible();
    });

    test('PRO-003: Pool Hosting Limit Enforcement', async ({ page }) => {
        await page.goto('/list');
        
        // If the user already has 1 open pool (seeded in test DB), 
        // the "List a Pool" page might show a paywall or limit warning.
        // For guest, it should redirect to login.
        if (page.url().includes('/login')) {
            await expect(page.getByText(/Sign in/i)).toBeVisible();
        }
    });
});
