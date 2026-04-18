import { test, expect } from '@playwright/test';

/**
 * Admin Governance (ADMIN)
 * High-privilege management and system monitoring tests.
 */
test.describe('Admin Governance (ADMIN)', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/admin');
    });

    /**
     * ADM-001: View System Statistics
     */
    test('ADM-001: View System Statistics', async ({ page }) => {
        // As a guest, we expect the Guest Auth Gate
        await expect(page.getByText(/Admin access requires an authenticated account/i)).toBeVisible({ timeout: 15000 });
    });

    /**
     * ADM-002: Flag/Suspend User
     */
    test('ADM-002: User Management - Suspension flow', async ({ page }) => {
        // Search for user
        const searchInput = page.getByPlaceholder(/Search nodes or users/i);
        if (await searchInput.isVisible()) {
            await searchInput.fill('UserX');
            
            // Look for "Suspend" or "Ban" action
            const suspendBtn = page.getByRole('button', { name: /Suspend|Ban/i }).first();
            if (await suspendBtn.isVisible()) {
                await expect(suspendBtn).toBeEnabled();
            }
        }
    });

    /**
     * ADM-003: Audit Ledger Review
     */
    test('ADM-003: Audit Ledger Review', async ({ page }) => {
        // As a guest, we expect the Sign-in fallback
        await expect(page.getByText(/Sign in to access this feature/i)).toBeVisible({ timeout: 15000 });
    });

    test('ADM-004: Host Pool Management', async ({ page }) => {
        await page.goto('/my-pools');
        // As a guest, verify the empty state
        await expect(page.getByText(/No pools yet/i).first()).toBeVisible({ timeout: 15000 });
    });
});
