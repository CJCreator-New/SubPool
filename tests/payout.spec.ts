import { test, expect } from '@playwright/test';

/**
 * Host Payout & Settlements (PAY)
 * Verifies the withdrawal request and administrative approval flow.
 */
test.describe('Host Payout & Settlements (PAY)', () => {

    test('PAY-001: Request Payout via Dashboard', async ({ page }) => {
        await page.goto('/payouts');
        
        // Verify dashboard visibility
        await expect(page.getByText(/Financial Ledger/i)).toBeVisible();
        
        const withdrawBtn = page.getByRole('button', { name: /Withdraw Earnings/i });
        await expect(withdrawBtn).toBeVisible();
        await withdrawBtn.click();
        
        // Verify Modal UI
        await expect(page.getByText(/Withdrawal Protocol/i)).toBeVisible();
        
        // Enter amount
        const amountInput = page.getByPlaceholder('0.00');
        await amountInput.fill('50');
        
        // Confirm
        const confirmBtn = page.getByRole('button', { name: /Confirm Withdrawal/i });
        await confirmBtn.click();
        
        // Verify Success Toast
        await expect(page.getByText(/Settlement Initialised/i)).toBeVisible();
    });

    test('PAY-002: Admin Approval Flow', async ({ page }) => {
        // This test simulates the admin side
        await page.goto('/admin');
        
        // Wait for admin dashboard access
        await expect(page.getByText(/Command Center/i)).toBeVisible();
        
        // Navigate to Payouts tab
        const payoutsTab = page.getByRole('button', { name: /Payouts/i });
        await payoutsTab.click();
        
        // Verify table and pending request
        await expect(page.getByText(/User \/ Uplink/i)).toBeVisible();
        
        const approveBtn = page.getByRole('button', { name: /Approve/i }).first();
        if (await approveBtn.isVisible()) {
            await approveBtn.click();
            // Verify status change in UI
            await expect(page.getByText(/completed/i)).toBeVisible();
        } else {
            console.log('No pending payouts to approve in current mock state');
        }
    });
});
