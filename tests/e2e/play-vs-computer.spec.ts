import { test, expect } from "@playwright/test";

test.describe("Play vs Computer", () => {
  test("creates game and redirects to game page", async ({ page }) => {
    await page.goto("/play/new");
    await expect(page.getByRole("heading", { name: /Play vs Computer/i })).toBeVisible();

    await page.getByLabel(/your name/i).fill("E2EPlayer");
    await page.getByRole("button", { name: /Start Game/i }).click();

    await expect(page).toHaveURL(/\/game\/[a-zA-Z0-9_-]+/);
  });

  test("game page shows board and Roll Dice button", async ({ page }) => {
    await page.goto("/play/new");
    await page.getByLabel(/your name/i).fill("E2EPlayer");
    await page.getByRole("button", { name: /Start Game/i }).click();

    await expect(page).toHaveURL(/\/game\/.+/);
    await expect(page.getByRole("button", { name: /Roll Dice/i })).toBeVisible({ timeout: 5000 });
  });

  test("Roll Dice updates game state", async ({ page }) => {
    await page.goto("/play/new");
    await page.getByLabel(/your name/i).fill("E2EPlayer");
    await page.getByRole("button", { name: /Start Game/i }).click();

    await expect(page.getByRole("button", { name: /Roll Dice/i })).toBeVisible({ timeout: 5000 });
    await page.getByRole("button", { name: /Roll Dice/i }).click();

    await expect(page.getByRole("button", { name: /End Turn/i })).toBeVisible({ timeout: 3000 });
  });
});
