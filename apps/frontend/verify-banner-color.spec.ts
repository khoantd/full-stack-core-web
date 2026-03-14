import { test, expect } from '@playwright/test';

test.describe('Home Page Banner Verification', () => {
  test('banner section should have ocean blue background color', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Find the hero section by its content
    const heroSection = page.locator('section').filter({ hasText: 'From engine components to braking systems' }).first();

    // Verify the hero section exists
    await expect(heroSection).toBeVisible();

    // Get the computed background color or check if it has cyan/ocean blue classes
    const className = await heroSection.getAttribute('class');

    // Verify the class contains ocean blue (cyan) background color
    expect(className).toContain('bg-cyan-500');

    // Additional check: verify the section text is visible with correct content
    await expect(heroSection.getByText('Quality Parts for Every Ride')).toBeVisible();
    await expect(heroSection.getByText('From engine components to braking systems')).toBeVisible();

    console.log('✅ Banner color verification passed: Ocean blue (cyan) background class is present');
  });
});
