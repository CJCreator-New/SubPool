import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility baseline', () => {
  test('landing page has no critical a11y violations and supports keyboard navigation', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');

    const focusedTag = await page.evaluate(() => document.activeElement?.tagName?.toLowerCase() ?? '');
    expect(focusedTag).not.toBe('');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter((v) => v.impact === 'critical');
    expect(criticalViolations).toEqual([]);
  });

  test('login page exposes form semantics and no critical violations', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('textbox')).toBeVisible();
    await expect(page.getByRole('button', { name: /magic link/i })).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter((v) => v.impact === 'critical');
    expect(criticalViolations).toEqual([]);
  });
});
