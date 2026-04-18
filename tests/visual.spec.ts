import { test, expect } from '@playwright/test';

/**
 * SubPool: Visual Regression Testing (VRT)
 * Protects the 'Wow' factor by comparing pixel-perfect snapshots.
 */

test.describe('Visual Regression Baseline', () => {
    
    test('Landing Page - Premium Hero & Grid', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveScreenshot('landing-page-hero.png', {
            mask: [page.locator('[data-testid="dynamic-count"]')], // Masking counters to avoid false positives
            threshold: 0.1
        });
    });

    test('Browse Pools - Grid Layout & Cards', async ({ page }) => {
        await page.goto('/browse');
        // Wait for skeleton loaders to finish
        await page.waitForSelector('text=Netflix');
        await expect(page).toHaveScreenshot('browse-grid-layout.png');
    });

    test('Messaging - Node Interface', async ({ page }) => {
        // We'll use the seeded E2E pool
        await page.goto('/messages');
        await page.waitForSelector('text=Messages');
        await expect(page).toHaveScreenshot('messaging-interface.png', {
            mask: [page.locator('text=/\\d+:\\d+/')], // Masking timestamps
            threshold: 0.2
        });
    });

    test('Referral Page - Viral Loop Progress', async ({ page }) => {
        await page.goto('/referrals');
        await page.waitForSelector('text=Scale the Network', { timeout: 15000 });
        await page.waitForTimeout(1000); // Allow motion animations to settle
        await expect(page).toHaveScreenshot('referral-dashboard.png');
    });

    test('Dark Mode Consistency', async ({ page }) => {
        await page.goto('/');
        // Verify background gradient aesthetics
        await expect(page.locator('body')).toHaveScreenshot('body-background-aesthetics.png');
    });
});
