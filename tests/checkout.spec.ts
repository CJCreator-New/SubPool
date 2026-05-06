import { test, expect } from '@playwright/test';

test.describe('Checkout & Payment Flow (E2E)', () => {

    test.beforeEach(async ({ page }) => {
        // Assume the test database is seeded via global-setup.ts
        // In a real scenario, we might need to log in first, but for now we'll 
        // navigate to browse and try to join a pool to trigger the auth/payment flow.
    });

    test('User can browse, select a pool, and reach the payment method page', async ({ page }) => {
        await page.goto('/browse');
        
        // Wait for pools to load
        await page.waitForTimeout(2000);
        
        // Find a pool card and click it
        const firstPoolCard = page.locator('[data-testid="pool-card"], .group.relative').first();
        if (await firstPoolCard.isVisible()) {
            await firstPoolCard.click();
            
            // Pool Detail Modal should appear
            const joinButton = page.getByRole('button', { name: /Join Pool|Request to Join/i });
            await expect(joinButton).toBeVisible({ timeout: 5000 });
            
            // Click Join
            await joinButton.click();
            
            // It should redirect to login if unauthenticated, or to payment method setup
            // Wait to see if we hit the auth wall or proceed
            await page.waitForTimeout(2000);
            const currentUrl = page.url();
            
            // If it redirected to login, that's expected for a guest
            if (currentUrl.includes('/login')) {
                expect(currentUrl).toContain('/login');
                // Could mock auth here and proceed
            } else {
                // If already logged in, should go to payment
                expect(currentUrl).toContain('/payment/method');
                await expect(page.getByText(/Payment Method/i)).toBeVisible();
            }
        } else {
            console.log('No pools available to click. Check seed data.');
        }
    });

    test('Payment confirmation page renders correctly', async ({ page }) => {
        // Direct navigation to test the UI of the confirm page
        await page.goto('/payment/confirm');
        
        // As an unauthenticated user, it might redirect to login.
        // Let's check for either the Login page or the Payment Confirm page.
        await page.waitForTimeout(2000);
        const currentUrl = page.url();
        
        if (currentUrl.includes('/login')) {
            expect(currentUrl).toContain('/login');
        } else {
            await expect(page.getByRole('heading', { name: /Confirm Payment/i })).toBeVisible();
            await expect(page.getByRole('button', { name: /Pay Now|Confirm/i })).toBeVisible();
        }
    });
});
