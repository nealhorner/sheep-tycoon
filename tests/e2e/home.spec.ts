import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('loads with title', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Sheep Tycoon/i })).toBeVisible();
  });

  test('Play vs Computer and Create/Join Lobby links are visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /Play vs Computer/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Create \/ Join Lobby/i })).toBeVisible();
  });

  test('How to Play section is present', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /How to Play/i })).toBeVisible();
  });

  test('Play vs Computer link navigates to play page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Play vs Computer/i }).click();
    await expect(page).toHaveURL(/\/play\/new/);
  });

  test('Create/Join Lobby link navigates to lobby', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Create \/ Join Lobby/i }).click();
    await expect(page).toHaveURL(/\/lobby/);
  });
});
