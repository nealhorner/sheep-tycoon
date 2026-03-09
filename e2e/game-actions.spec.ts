import { test, expect } from "@playwright/test";

test.describe("Game actions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/play/new");
    await page.getByLabel(/your name/i).fill("E2EPlayer");
    await page.getByRole("button", { name: /Start Game/i }).click();
    await expect(page).toHaveURL(/\/game\/.+/);
  });

  test("roll then end turn", async ({ page }) => {
    await page.getByRole("button", { name: /Roll Dice/i }).click();
    await expect(page.getByRole("button", { name: /End Turn/i })).toBeVisible({ timeout: 3000 });
    await page.getByRole("button", { name: /End Turn/i }).click();
    await expect(page.getByRole("button", { name: /Roll Dice/i })).toBeVisible({ timeout: 5000 });
  });

  test("buy improvement when in action phase", async ({ page }) => {
    await page.getByRole("button", { name: /Roll Dice/i }).click();
    await expect(page.getByRole("button", { name: /End Turn/i })).toBeVisible({ timeout: 3000 });

    const buyButton = page.getByRole("button", { name: /fence.*150/i }).first();
    if (await buyButton.isVisible()) {
      await buyButton.click();
      await expect(page.getByText(/Tiles:/)).toContainText("fence", { timeout: 2000 });
    }
  });
});
