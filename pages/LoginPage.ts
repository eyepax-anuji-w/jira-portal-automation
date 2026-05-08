import type { Page } from '@playwright/test';
import { MOOD_POPUP_TEXT } from '../test-data/expected-values';
import { loginPagePath } from '../test-data/module-urls';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async gotoLogin(): Promise<void> {
    await this.page.goto(loginPagePath());
    await this.page.waitForLoadState('domcontentloaded');
  }

  async login(userId: string, password: string): Promise<void> {
    await this.page.locator('#inputEmail').fill(userId);
    await this.page.locator('#inputPassword').fill(password);
    await this.page.getByRole('button', { name: /sign in/i }).click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /**
   * After login the app may show a mood capture modal — dismiss to reach main app.
   */
  async dismissMoodPopupIfPresent(): Promise<void> {
    const indicator = this.page.getByText(MOOD_POPUP_TEXT);
    const visible = await indicator.isVisible({ timeout: 4000 }).catch(() => false);
    if (!visible) return;

    const happyImg = this.page.locator('img[alt*="Happy" i], img[title*="Happy" i]').first();
    if (await happyImg.isVisible({ timeout: 2000 }).catch(() => false)) {
      await happyImg.click();
    } else {
      await this.page.locator('img').first().click().catch(() => {});
    }

    await indicator.waitFor({ state: 'hidden', timeout: 25_000 }).catch(() => {});
    await this.page.waitForURL(/EYEPAX|dashboard|app_login/i, { timeout: 30_000 }).catch(() => {});
  }

  forgotPasswordLink() {
    return this.page.getByRole('link', { name: /forgot password/i });
  }

  userIdInput() {
    return this.page.locator('#inputEmail');
  }

  passwordInput() {
    return this.page.locator('#inputPassword');
  }

  signInButton() {
    return this.page.getByRole('button', { name: /sign in/i });
  }
}
