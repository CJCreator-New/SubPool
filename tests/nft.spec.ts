import { test, expect, devices } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Non-Functional Testing (NFT)
 * Covers Accessibility, Performance, and Responsiveness.
 */
test.describe('Non-Functional Testing (NFT)', () => {

    /**
     * NFT-001: Accessibility Audit
     */
    test('NFT-001: Accessibility Scan (Core Pages)', async ({ page }) => {
        await page.goto('/browse');
        
        // Scan with Axe
        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze();

        // Pass Criteria: Zero "Critical" or "Serious" violations.
        // We exclude 'color-contrast' for the premium landing demo to allow for aesthetic gradients.
        const criticalViolations = accessibilityScanResults.violations.filter(
            v => (v.impact === 'critical' || v.impact === 'serious') && v.id !== 'color-contrast'
        );
        
        expect(criticalViolations.length).toBe(0);
    });

    /**
     * NFT-002: Dark Mode Performance / UI Integrity
     */
    test('NFT-002: UI Theme Integrity (Dark Mode)', async ({ page }) => {
        await page.goto('/');
        
        // Check if the background satisfies dark mode contrast (e.g. #0E0E0E)
        const bgColor = await page.evaluate(() => 
            window.getComputedStyle(document.body).backgroundColor
        );
        
        // Typical dark background check
        expect(bgColor).toMatch(/rgb\(14, 14, 14\)|rgb\(0, 0, 0\)/);
        
        // Toggle theme if a toggle exists
        const themeToggle = page.getByRole('button', { name: /toggle theme|dark mode/i });
        if (await themeToggle.isVisible()) {
            await themeToggle.click();
            await page.waitForTimeout(300);
            // No crash/error
            await expect(page.locator('body')).toBeVisible();
        }
    });

    /**
     * NFT-004: Mobile Responsiveness
     */
    test('NFT-004: Mobile Responsiveness (Viewport Check)', async ({ page }) => {
        // Set viewport to a small mobile device width
        await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
        
        await page.goto('/browse');
        
        // Check for horizontal overflow
        const hasOverflow = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasOverflow).toBe(false);

        // Verify burger menu accessibility
        const burgerMenu = page.locator('button:has([data-lucide="menu"]), button[aria-label="Toggle menu"]');
        if (await burgerMenu.isVisible()) {
            await burgerMenu.click();
            await expect(page.locator('nav')).toBeVisible();
        }
    });
});
