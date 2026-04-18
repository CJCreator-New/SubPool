import { test, expect } from '@playwright/test';

test.describe('Authentication (AUTH)', () => {
    
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
    });

    test('AUTH-001: Email Magic Link Request', async ({ page }) => {
        const email = `test-${Date.now()}@example.com`;
        
        await page.getByLabel(/email/i).fill(email);
        await page.getByRole('button', { name: /Send magic link/i }).click();

        // Check for success state
        await expect(page.getByText('Magic link sent')).toBeVisible({ timeout: 15000 });
        await expect(page.getByText(email)).toBeVisible();
    });

    test('AUTH-002: Invalid Email Format', async ({ page }) => {
        await page.getByLabel(/email/i).fill('not-an-email');
        const submitBtn = page.getByRole('button', { name: /Send magic link/i });
        
        // Browser validation usually kicks in first for type="email"
        // But let's check if the form submits or if it's blocked
        await submitBtn.click();
        
        // If it was blocked, we should still be on the login form (no "Magic link sent" text)
        await expect(page.getByText('Magic link sent')).not.toBeVisible();
    });

    test('AUTH-004: Guest Mode Redirection', async ({ page }) => {
        await page.click('text=Browse as guest');
        await expect(page).toHaveURL(/.*browse/);
        await expect(page.getByText(/Browse Pools/i).first()).toBeVisible();
    });

    test('AUTH-003: Social Login Button Presence', async ({ page }) => {
        // Verify Google/Social provider buttons exist
        const googleBtn = page.getByRole('button', { name: /Google/i });
        await expect(googleBtn).toBeVisible();
        
        // Ensure it has the correct OAuth link pattern (don't click as it would leave the app)
        // const href = await googleBtn.getAttribute('href');
        // if (href) expect(href).toContain('supabase.co/auth/v1/authorize');
    });
});
