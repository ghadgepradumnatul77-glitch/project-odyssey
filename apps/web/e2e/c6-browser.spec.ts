import { expect, test } from '@playwright/test';

const password = process.env.C6_E2E_PASSWORD || 'C6-Synthetic-Only-Password-2026!';

async function login(page: import('@playwright/test').Page, email: string) {
  await page.goto('/');
  await page.getByLabel('Government or organizational email').fill(email);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: 'Sign in securely' }).click();
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
}

test('OFFICER sees governed case surfaces and assigns a scoped officer without raw UUID identity', async ({ page }) => {
  await login(page, 'c6.primary@example.test');
  await expect(page.getByRole('button', { name: /Policy & Actions/ })).toHaveCount(0);
  await page.getByRole('button', { name: /Cases/ }).click();
  const caseButton = page.getByRole('button', { name: /C6 BROWSER synthetic public report/i });
  await expect(caseButton).toBeVisible();
  await caseButton.click();
  await page.getByRole('button', { name: 'Risk', exact: true }).click();
  await expect(page.getByText(/Very High|Critical/i).first()).toBeVisible();
  await page.getByRole('button', { name: 'Response & Decision' }).click();
  await expect(page.getByText('Decision Package').first()).toBeVisible();
  await expect(page.getByText(/Action Plan/i).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Human decisions' })).toBeVisible();
  await page.getByRole('button', { name: 'Execution', exact: true }).click();
  const selector = page.getByLabel('Eligible officer').first();
  await expect(selector).toBeVisible();
  await expect(selector.locator('option')).toHaveCount(4);
  const candidateLabels = await selector.locator('option').allTextContents();
  for (const name of ['C6 Primary Officer', 'C6 Independent Verifier', 'C6 Independent Closer']) {
    expect(candidateLabels.some((label) => label.includes(name))).toBe(true);
  }
  const primaryOption = selector.locator('option', { hasText: 'C6 Primary Officer' });
  const candidateId = await primaryOption.getAttribute('value');
  expect(candidateId).toMatch(/^[0-9a-f-]{36}$/i);
  await selector.selectOption(candidateId!);
  await page.getByRole('button', { name: 'Assign', exact: true }).first().click();
  await expect(page.getByText(/C6 Primary Officer/).first()).toBeVisible();
  await expect(page.locator('body')).not.toContainText(candidateId!);
});

test('POLICY_ADMIN transitions a scoped draft while global governance remains read-only', async ({ page }) => {
  await login(page, 'c6.policy@example.test');
  await page.getByRole('button', { name: /Policy & Actions/ }).click();
  await page.getByRole('button', { name: 'Approved actions' }).click();
  await expect(page.getByText(/ACT_C6_SYNTHETIC_INSPECTION · v1/)).toBeVisible();
  await page.getByRole('button', { name: 'Policy documents' }).click();
  const globalCard = page.getByText('C6_GLOBAL_READ_ONLY · v1').locator('xpath=ancestor::article');
  await expect(globalCard.getByText('Read-only in your organizational scope.')).toBeVisible();
  const draftCard = page.getByText('C6_BROWSER_DRAFT · v1').locator('xpath=ancestor::article');
  await draftCard.getByRole('button', { name: 'Move to validation' }).click();
  await page.getByRole('button', { name: 'Confirm transition' }).click();
  await expect(page.getByRole('status')).toContainText(/moved to VALIDATION/i);
  await expect(page.getByRole('button', { name: /Cases/ })).toBeVisible();
  await expect(page.getByText(/Execution tasks|Assign task/)).toHaveCount(0);
});

test('public citizen submits and tracks a privacy-safe disposable report without protected navigation', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Report an infrastructure issue' }).click();
  await page.getByLabel('Category').selectOption('ROAD_DAMAGE');
  await page.getByLabel('Issue title').fill('C6 public browser synthetic report');
  await page.getByLabel('Description').fill('Obviously synthetic public browser report used only for isolated C6 validation.');
  await page.getByLabel('Location or landmark').fill('C6 synthetic browser location');
  await page.getByRole('button', { name: 'Submit report' }).click();
  await expect(page.getByRole('heading', { name: /Thank you/ })).toBeVisible();
  const reference = await page.locator('dd').first().textContent();
  expect(reference).toMatch(/^JNV-PUB-/);
  await page.getByRole('button', { name: 'Track this report' }).click();
  await page.getByRole('button', { name: 'Track report' }).click();
  await expect(page.getByRole('definition').filter({ hasText: 'Report received' })).toBeVisible();
  const body = await page.locator('body').innerText();
  expect(body).not.toMatch(/officer email|reviewer|verifier|closer|decision notes|inspection notes|policy conflict/i);
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toHaveCount(0);
});
