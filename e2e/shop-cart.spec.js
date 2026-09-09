import { expect, test } from '@playwright/test';

test('shop to cart to checkout', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /curated departments/i })).toBeVisible();

  await page.getByRole('link', { name: 'Shop', exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Shop' })).toBeVisible();

  await page.getByRole('button', { name: 'Add to Cart' }).first().click();
  await expect(page.getByText(/added to cart/i)).toBeVisible();

  await page.getByRole('link', { name: 'Shopping cart' }).click();
  await expect(page.getByRole('heading', { name: 'Your Cart' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Checkout' })).toBeVisible();

  await page.getByRole('button', { name: 'Checkout' }).click();
  await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();

  await page.getByLabel('Full name').fill('Amara Cole');
  await page.getByLabel('Email').fill('amara@example.com');
  await page.getByLabel('Phone').fill('08012345678');
  await page.getByLabel('Address').fill('12 Admiralty Way');
  await page.getByRole('button', { name: /pay with paystack/i }).click();

  await expect(page.getByRole('heading', { name: /order received/i })).toBeVisible({ timeout: 15000 });
});

test('search filters the shop', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Search products').fill('dress');
  await page.getByLabel('Search products').press('Enter');
  await expect(page.getByText(/results for/i)).toBeVisible();
});
