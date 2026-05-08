import { expect } from '@playwright/test';
import { HEADING_PATTERNS } from '../../test-data/expected-values';
import { ModuleURLs, loginPagePath } from '../../test-data/module-urls';
import {
  culturalActivitiesHeadingYears,
  leaveSummaryHeadingYears,
  procedureMissesRangeLabel,
} from '../../utils/date-helper';
import {
  frameCulturalActivities,
  frameControls,
  frameDashboardNav,
  frameLeaveSummary,
  frameProcedureMisses,
  waitForFrameBody,
} from '../../utils/frame-helper';
import { BasePage } from '../BasePage';

export class UserDashboardPage extends BasePage {
  // widget7 — visible after clicking "User Dashboard" (User Dashboard view)
  leaveSummaryFrame() {
    return frameLeaveSummary(this.page);
  }

  // widget8 in Cultural Dashboard mode shows Cultural Activities
  culturalActivitiesFrame() {
    return frameCulturalActivities(this.page);
  }

  procedureMissesFrame() {
    return frameProcedureMisses(this.page);
  }

  // widget10 — controls frame in Cultural Dashboard mode (has "User Dashboard" button)
  controlsFrame() {
    return frameControls(this.page);
  }

  // widget6 — controls frame in User Dashboard mode (has year-select + "Cultural Dashboard")
  dashboardNavFrame() {
    return frameDashboardNav(this.page);
  }

  // In User Dashboard mode the year-select is in widget6 (confirmed via codegen)
  yearDropdown() {
    return this.dashboardNavFrame().locator('#year-select');
  }

  async openDashboard(): Promise<void> {
    await this.page.goto(ModuleURLs.eyepaxRoot);
    await this.page.waitForLoadState('networkidle').catch(() => {});

    if (await this._isInvalidDataShown()) {
      await this._freshLogin();
    }

    await waitForFrameBody(this.content(), 20_000).catch(() => {});

    // Wait for widget10 to be ready before reading its button state
    await waitForFrameBody(this.controlsFrame(), 20_000).catch(() => {});

    // Only click "User Dashboard" if currently in Cultural mode (button present in widget10).
    // Skips the click if storageState already restored the User Dashboard view.
    const userDashBtn = this.controlsFrame().getByRole('button', { name: 'User Dashboard' });
    const inCulturalMode = await userDashBtn.isVisible({ timeout: 3_000 }).catch(() => false);
    if (inCulturalMode) {
      await userDashBtn.click({ timeout: 10_000 }).catch(() => {});
      await this.waitForNetworkSettled();
    }

    await waitForFrameBody(this.leaveSummaryFrame(), 25_000).catch(() => {});
    // After "User Dashboard" click, controls move to widget6 — wait for it directly
    await waitForFrameBody(this.dashboardNavFrame(), 20_000).catch(() => {});
    await this.yearDropdown().waitFor({ state: 'visible', timeout: 25_000 }).catch(() => {});
  }

  protected async _isInvalidDataShown(): Promise<boolean> {
    return this.page
      .locator('body')
      .getByText('Invalid data', { exact: true })
      .isVisible({ timeout: 3_000 })
      .catch(() => false);
  }

  protected async _freshLogin(): Promise<void> {
    const userId = process.env.E2E_USER_ID ?? '';
    const password = process.env.E2E_PASSWORD ?? '';

    await this.page.goto(loginPagePath());
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.locator('#inputEmail').fill(userId);
    await this.page.locator('#inputPassword').fill(password);
    await this.page.getByRole('button', { name: /sign in/i }).click();
    await this.page.waitForLoadState('networkidle').catch(() => {});

    const moodVisible = await this.page
      .getByText(/How Are You Feeling/i)
      .isVisible({ timeout: 5_000 })
      .catch(() => false);
    if (moodVisible) {
      await this.page
        .locator('img[alt*="Happy" i], img[title*="Happy" i]')
        .first()
        .click()
        .catch(() => {});
      await this.page
        .getByText(/How Are You Feeling/i)
        .waitFor({ state: 'hidden', timeout: 15_000 })
        .catch(() => {});
      await this.page.waitForLoadState('networkidle').catch(() => {});
    }
  }

  async selectYear(year: number): Promise<void> {
    const dd = this.yearDropdown();
    await dd.waitFor({ state: 'visible', timeout: 25_000 });
    await dd.selectOption(String(year));
    await this.waitForNetworkSettled();
    // After year change the widgets reload; wait for the dropdown to come back
    await dd.waitFor({ state: 'visible', timeout: 20_000 }).catch(() => {});
  }

  async expectLeaveSummaryHeading(year: number): Promise<void> {
    const { current, previous } = leaveSummaryHeadingYears(year);
    const pattern = HEADING_PATTERNS.leaveSummary(current, previous);
    await expect(this.leaveSummaryFrame().getByText(pattern).first()).toBeVisible({
      timeout: 25_000,
    });
  }

  async expectCulturalActivitiesHeading(year: number): Promise<void> {
    const { y1, y2 } = culturalActivitiesHeadingYears(year);
    const pattern = HEADING_PATTERNS.culturalActivities(y1, y2);
    await expect(this.culturalActivitiesFrame().getByText(pattern).first()).toBeVisible({
      timeout: 25_000,
    });
  }

  async expectProcedureMissesHeading(year: number): Promise<void> {
    const range = procedureMissesRangeLabel(year);
    const pattern = HEADING_PATTERNS.procedureMisses(range);
    await expect(this.procedureMissesFrame().getByText(pattern).first()).toBeVisible({
      timeout: 25_000,
    });
  }

  async expectDashboardChromeVisible(): Promise<void> {
    await expect.soft(this.yearDropdown()).toBeVisible({ timeout: 25_000 });
    await expect
      .soft(this.leaveSummaryFrame().getByText(/LEAVE SUMMARY/i).first())
      .toBeVisible({ timeout: 25_000 });
  }
}
