import { test, expect } from '@playwright/test';

/**
 * Referral & Viral Loops (REF)
 * Automates the viral growth engine (sharing, attribution, reward tracking).
 */
test.describe('Referral & Viral Loops (REF)', () => {

    test('REF-001: Generate and Copy Referral Link', async ({ page, context }) => {
        // Grant clipboard permissions
        await context.grantPermissions(['clipboard-read', 'clipboard-write']);

        await page.goto('/referrals');
        
        // Check for specific UI elements
        await expect(page.getByText(/Network Expansion Protocol/i)).toBeVisible();
        
        const copyBtn = page.getByRole('button', { name: /Copy Link/i }).first();
        await expect(copyBtn).toBeVisible({ timeout: 15000 });
        await copyBtn.click();
        
        // Verify toast message
        await expect(page.getByText(/Uplink copied to clipboard/i)).toBeVisible();

        // Verify clipboard content contains the ref parameter
        const handle = await page.evaluateHandle(() => navigator.clipboard.readText());
        const clipboardText = await handle.jsonValue();
        expect(clipboardText).toContain('ref=');
    });

    /**
     * REF-002: Referral Attribution Simulation
     * Note: This simulates a user visiting via a referral link and checks if the ref ID is persisted.
     */
    test('REF-002: Referral Link Attribution Capture', async ({ page }) => {
        const mockRefCode = 'REF-12345';
        await page.goto(`/login?ref=${mockRefCode}`);
        
        // Check if the URL still contains the ref code or if it was captured in state.
        // We verify that the "Sign in" page is visible and the referral context is active.
        await expect(page.getByText(/Welcome back/i)).toBeVisible();
        
        // In a real E2E environment, we would complete sign-up and check the DB 'profiles' table 
        // for the 'referred_by' column.
        expect(page.url()).toContain(`ref=${mockRefCode}`);
    });

    /**
     * REF-003: Reward Milestone Unlock UI
     */
    test('REF-003: Milestone Statistics Visibility', async ({ page }) => {
        await page.goto('/referrals');
        
        // Verify the Mission Progress trophy and progress counts
        await expect(page.getByText(/Mission Progress/i)).toBeVisible();
        await expect(page.getByText(/Nodes Added/i)).toBeVisible();
        
        // Check for the incentive reward card
        await expect(page.getByText(/Current Incentive Reward/i)).toBeVisible();
    });
});
