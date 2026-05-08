import { expect, test } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

test.describe('Forgot password', () => {
  test('LMU-008 | Forgot password link navigates to reset flow', async ({ page }) => {
    const login = new LoginPage(page);
    await login.gotoLogin();
    await login.forgotPasswordLink().click();

    await expect(
      page.getByText(/reset|forgot|password|user id|email/i).first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test('FP-02 | Validation for empty User Id on reset flow', async ({ page }) => {
    const login = new LoginPage(page);
    await login.gotoLogin();
    await login.forgotPasswordLink().click();
    await page.waitForURL(/retrieve|pswd|reset/i, { timeout: 15_000 });

    const okControl = page
      .locator('input[type="submit"], input[type="button"], input[type="image"], button, a')
      .filter({ hasText: /\bOK\b/i })
      .and(page.locator(':not(#id_message_display_buttone)'));
    await okControl.first().scrollIntoViewIfNeeded();
    await okControl.first().click();

    await expect(
      page.locator('#swal2-content').or(page.getByText(/User Id:\s*Required field/i))
    ).toBeVisible({ timeout: 15_000 });
  });

  test('FP-01 | Forgot Password successful email request', async ({ page }) => {
    const userId = process.env.E2E_FORGOT_PASSWORD_USER_ID ?? process.env.E2E_USER_ID;
    test.skip(!userId, 'Set E2E_FORGOT_PASSWORD_USER_ID or E2E_USER_ID');

    const login = new LoginPage(page);
    await login.gotoLogin();
    await login.forgotPasswordLink().click();

    const input = page
      .locator('tr:has-text("User Id") input[type="text"], tr:has-text("User Id") input:not([type])')
      .first()
      .or(page.locator('input[type="text"]:visible, input:not([type]):visible').first());
    await expect(input).toBeVisible({ timeout: 15_000 });
    await input.click();
    await input.fill('');
    await input.type(userId!, { delay: 20 });
    await expect(input).toHaveValue(userId!);

    const okControl = page
      .locator('input[type="submit"], input[type="button"], input[type="image"], button, a')
      .filter({ hasText: /\bOK\b/i })
      .and(page.locator(':not(#id_message_display_buttone)'));
    await okControl.first().scrollIntoViewIfNeeded();
    await okControl.first().click();

    const message = page.locator('#swal2-content').or(page.getByText(/sent successfully|required field|invalid/i));
    await expect(message.first()).toBeVisible({ timeout: 25_000 });
    await expect(message.first()).toContainText(/sent successfully/i);
  });

  test('FP-03 | Back navigation from reset page returns to login page', async ({ page }) => {
    const login = new LoginPage(page);
    await login.gotoLogin();
    await login.forgotPasswordLink().click();
    await page.waitForURL(/retrieve|pswd|reset/i, { timeout: 15_000 });

    const backControl = page
      .locator('input[type="button"], button, a')
      .filter({ hasText: /\bBack\b/i })
      .first();
    await backControl.click();
    await expect(page).toHaveURL(/app_login/i, { timeout: 20_000 });
  });

  test('FP-04 | Login with reset password', async ({ page }) => {
    const userId = process.env.E2E_USER_ID;
    const password = process.env.E2E_PASSWORD;
    test.skip(!userId || !password, 'Set E2E_USER_ID and E2E_PASSWORD for reset-password login validation');

    const login = new LoginPage(page);
    await login.gotoLogin();
    await login.login(userId!, password!);
    await login.dismissMoodPopupIfPresent();
    await expect(page).not.toHaveURL(/app_login/i, { timeout: 30_000 });
  });
});
