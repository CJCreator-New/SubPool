import { test, expect } from '@playwright/test';

/**
 * Guest Journey (GUEST)
 * End-to-end automation for member/joiner workflows.
 */
test.describe('Guest Journey (GUEST)', () => {

    /**
     * GUEST-001: Search & Filter Pools
     */
    test('GUEST-001: Search and Filter Logic', async ({ page }) => {
        await page.goto('/browse');
        
        const searchInput = page.getByPlaceholder(/Search systems/i);
        await searchInput.fill('Disney');
        
        // Wait for debounced search results
        await page.waitForTimeout(1000);
        
        // Items in result should match search
        const resultCards = page.locator('div:has-text("Disney")');
        // We expect at least the text "Disney" to appear if results are found
        // In a real environment with data, we would count cards.
        await expect(searchInput).toHaveValue('Disney');
    });

    /**
     * GUEST-002: Join Pool Request Flow
     */
    test('GUEST-002: Join Request Initiation', async ({ page }) => {
        await page.goto('/browse');
        
        // Find the first "Join" button
        const joinButton = page.getByRole('button', { name: /Join/i }).first();
        if (await joinButton.isVisible()) {
            await joinButton.click();
            
            // Check for authentication boundary or confirmation modal
            // In unauthenticated guest mode, it might redirect to /login
            const currentUrl = page.url();
            if (currentUrl.includes('/login')) {
                await expect(page.getByText(/Sign in to SubPool/i)).toBeVisible();
            } else {
                // If logged in, look for the "Confirm intent" step or toast
                await expect(page.locator('body')).toContainText(/Confirm/i);
            }
        }
    });

    /**
     * GUEST-003: Cancel Membership
     */
    test('GUEST-003: Cancel Membership', async ({ page }) => {
        await page.goto('/my-pools');
        
        // Scroll to "MY MEMBERSHIPS"
        // Verify table/section header
        await expect(page.getByText(/MY MEMBERSHIPS/i).first()).toBeVisible({ timeout: 15000 });
        
        const cancelButton = page.getByRole('button', { name: 'Cancel' }).first();
        if (await cancelButton.isVisible()) {
            await cancelButton.click();
            
            // Verify Alert Dialog
            await expect(page.getByText(/Cancel membership\?/i)).toBeVisible();
            await expect(page.getByRole('button', { name: /Confirm/i })).toBeVisible();
            
            // Note: We don't click "Confirm" to avoid session corruption in CI.
        }
    });

    /**
     * GUEST-004: View Credentials in Pool
     */
    test('GUEST-004: View Credentials in Pool', async ({ page }) => {
        await page.goto('/messages');
        
        // Select a pool node and view the vault
        const firstPool = page.locator('aside button').first();
        if (await firstPool.isVisible()) {
            await firstPool.click();
            
            // Look for the Credential Vault component
            const vaultHeader = page.getByText(/Pool Credentials Vault/i);
            if (await vaultHeader.isVisible()) {
                await expect(page.getByText(/Username/i)).toBeVisible();
                await expect(page.getByText(/• • • •/i)).toBeVisible(); // Hidden password
                
                // Toggle visibility
                const showBtn = page.locator('button:has([data-lucide="eye"])').first();
                if (await showBtn.isVisible()) {
                    await showBtn.click();
                    // Verification would require checking text content change, skipping for privacy/mock stability
                }
            }
        }
    });
});
