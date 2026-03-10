import { test, expect } from '@playwright/test';

test.describe('Lobby', () => {
  test('lobby page has Create and Join options', async ({ page }) => {
    await page.goto('/lobby');
    await expect(page.getByRole('link', { name: /Create Lobby/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Join Lobby/i })).toBeVisible();
  });

  test('create lobby flow', async ({ page }) => {
    await page.goto('/lobby');
    await page.getByRole('link', { name: /Create Lobby/i }).click();

    await expect(page).toHaveURL(/\/lobby\/create/);
    await page.getByLabel(/your name/i).fill('HostPlayer');
    await page.getByRole('button', { name: /Create Lobby/i }).click();

    await expect(page).toHaveURL(/\/lobby\/[a-zA-Z0-9]+/);
    await expect(page.getByText(/share this code/i)).toBeVisible();
  });

  test('lobby shows host in player list', async ({ page }) => {
    await page.goto('/lobby/create');
    await page.getByLabel(/your name/i).fill('HostPlayer');
    await page.getByRole('button', { name: /Create Lobby/i }).click();

    await expect(page.getByText('HostPlayer')).toBeVisible({ timeout: 5000 });
  });
});
