import { expect, test } from '@playwright/test';

test('user can add a product and see it in the dashboard', async ({ page }) => {
  const productName = `Mechanical Keyboard ${Date.now()}`;

  await page.goto('/');

  await page.getByLabel('Product name').fill(productName);
  await page.getByLabel('Product URL').fill('https://shop.example.com/keyboard');
  await page.getByLabel('Current price').fill('129.99');
  await page.getByRole('button', { name: 'Track product' }).click();

  const row = page.locator('article').filter({ hasText: productName });
  await expect(row).toBeVisible();
  await expect(row.getByText('https://shop.example.com/keyboard')).toBeVisible();
  await expect(row.getByText('$129.99').first()).toBeVisible();
});
