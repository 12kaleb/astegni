import { test, expect } from '@playwright/test';

test('signup collects account details and shows confirmation', async ({ page }) => {
  await page.route('**/api/auth/signup', (route) => route.fulfill({
    status: 201,
    contentType: 'application/json',
    body: JSON.stringify({ name: 'Demo Learner', role: 'student', hasSession: false, confirmationRequired: true }),
  }));
  await page.goto('/?auth=register');
  await page.getByRole('button', { name: 'Continue to Details' }).click();
  await page.getByPlaceholder('e.g. Alex Tadesse').fill('Demo Learner');
  await page.getByPlaceholder('you@example.com').fill('demo-learner@example.test');
  await page.getByPlaceholder('At least 8 characters').fill('demo-password-123');
  await page.getByRole('button', { name: 'Next: Preferences' }).click();
  await page.getByRole('button', { name: 'Complete Registration' }).click();
  await expect(page.getByText('Check your email')).toBeVisible();
});

test('mobile navigation can be opened and used from the keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const menu = page.getByRole('button', { name: 'Open navigation menu' });
  await menu.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Close navigation menu' })).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('link', { name: 'Find Tutors' }).click();
  await expect(page).toHaveURL(/\/tutors$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

async function signIn(page, email) {
  await page.goto('/?auth=signin');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(process.env.E2E_PASSWORD);
  await page.getByRole('button', { name: 'Sign In to Account' }).click();
  await expect(page.getByRole('button', { name: 'Sign In to Account' })).toBeHidden({ timeout: 20_000 });
}

test('student can submit a booking request to an available tutor', async ({ page }) => {
  test.skip(!process.env.E2E_STUDENT_EMAIL || !process.env.E2E_TUTOR_ID || !process.env.E2E_PASSWORD, 'Requires dedicated staging student and tutor fixtures.');
  await signIn(page, process.env.E2E_STUDENT_EMAIL);
  await page.goto(`/tutors/${encodeURIComponent(process.env.E2E_TUTOR_ID)}`);
  await page.getByRole('heading', { name: 'Request a lesson' }).waitFor();
  const future = new Date();
  future.setDate(future.getDate() + ((8 - future.getDay()) % 7 || 7));
  future.setHours(10, 0, 0, 0);
  const localDateTime = new Date(future.getTime() - future.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
  await page.getByLabel('Lesson date and time').fill(localDateTime);
  await page.getByRole('button', { name: 'Request booking' }).click();
  await expect(page.getByRole('status')).toContainText('Booking request sent.');
});

test('administrator can approve a pending tutor', async ({ page }) => {
  test.skip(!process.env.E2E_ADMIN_EMAIL || !process.env.E2E_PASSWORD, 'Requires a dedicated staging administrator and pending tutor fixture.');
  await signIn(page, process.env.E2E_ADMIN_EMAIL);
  await page.goto('/dashboard');
  const approve = page.getByRole('button', { name: /Approve/ }).first();
  await expect(approve).toBeVisible();
  await approve.click();
  await expect(approve).toBeHidden();
});
