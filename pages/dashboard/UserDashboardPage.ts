import type { FrameLocator, Locator } from '@playwright/test';
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

  /** Popup overlay used by leave drill-downs and procedure miss details (`details-locators.md`). */
  popupFrame(): FrameLocator {
    return this.page.frameLocator('#popupIframe');
  }

  async closePopup(): Promise<void> {
    const close = this.popupFrame().getByText('Close', { exact: true }).first();
    await close.click({ timeout: 15_000 }).catch(() => {});
    await this.popupFrame()
      .locator('body')
      .waitFor({ state: 'hidden', timeout: 10_000 })
      .catch(() => {});
  }

  noticeSummaryHeading(): Locator {
    return this.leaveSummaryFrame().getByRole('heading', { name: /Notice Summary/i });
  }

  async expectNoticeSummaryHeadersVisible(): Promise<void> {
    const f = this.leaveSummaryFrame();
    await expect.soft(f.getByRole('cell', { name: 'Total Used', exact: true }).first()).toBeVisible({
      timeout: 20_000,
    });
    await expect.soft(f.getByRole('cell', { name: 'Correct Notice', exact: true }).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect.soft(f.getByRole('cell', { name: 'Short Notice', exact: true }).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect.soft(f.getByRole('cell', { name: 'No Notice', exact: true }).first()).toBeVisible({
      timeout: 15_000,
    });
  }

  async expectNoticeYearColumnHeaders(year: number): Promise<void> {
    const prev = year - 1;
    const f = this.leaveSummaryFrame();
    await expect.soft(f.getByRole('cell', { name: String(year), exact: true }).first()).toBeVisible({
      timeout: 20_000,
    });
    await expect.soft(f.getByRole('cell', { name: String(prev), exact: true }).first()).toBeVisible({
      timeout: 15_000,
    });
  }

  async expectNoRecordsFoundInNoticeSummary(): Promise<void> {
    await expect(
      this.leaveSummaryFrame().getByText(/No Records Found/i).first(),
    ).toBeVisible({ timeout: 25_000 });
  }

  /** Expected leave type labels on the dashboard grid (configurable per env). */
  async expectLeaveTypeRowsPresent(
    types: readonly string[] = ['Casual', 'Annual', 'Medical', 'Lieu', 'No-Pay'],
  ): Promise<void> {
    const f = this.leaveSummaryFrame();
    for (const t of types) {
      await expect.soft(f.getByRole('cell', { name: t, exact: true }).first()).toBeVisible({
        timeout: 20_000,
      });
    }
  }

  upcomingLeavesBanner(): Locator {
    return this.leaveSummaryFrame().locator('body').filter({
      hasText: /upcoming leaves|pending leave request|PENDING/i,
    });
  }

  async expectUpcomingLeavesAreaVisible(): Promise<void> {
    const text = this.leaveSummaryFrame().getByText(
      /HAS NO UPCOMING|has no upcoming leaves|pending leave request|PENDING HR|PENDING SUPERVISOR/i,
    );
    await expect(text.first()).toBeVisible({ timeout: 25_000 });
  }

  userProfileButton(): Locator {
    return this.dashboardNavFrame().getByRole('button', { name: /User Profile/i });
  }

  culturalDashboardButton(): Locator {
    return this.dashboardNavFrame().getByRole('button', { name: /Cultural Dashboard/i });
  }

  async clickUserProfileButton(): Promise<void> {
    await this.userProfileButton().click({ timeout: 15_000 });
    await this.waitForNetworkSettled();
  }

  async clickCulturalDashboardButton(): Promise<void> {
    await this.culturalDashboardButton().click({ timeout: 15_000 });
    await this.waitForNetworkSettled();
    await waitForFrameBody(this.culturalActivitiesFrame(), 25_000).catch(() => {});
  }

  /** Widget10 control shown when landing on Cultural Dashboard or returning from deep links. */
  async clickUserDashboardFromToolbar(): Promise<void> {
    await this.controlsFrame().getByRole('button', { name: 'User Dashboard' }).click({ timeout: 20_000 });
    await this.waitForNetworkSettled();
    await waitForFrameBody(this.dashboardNavFrame(), 25_000).catch(() => {});
    await this.yearDropdown().waitFor({ state: 'visible', timeout: 25_000 }).catch(() => {});
  }

  leaveTypeLink(name: string | RegExp): Locator {
    return this.leaveSummaryFrame().getByRole('link', { name });
  }

  async expectTopNavLinksVisible(): Promise<void> {
    await expect.soft(this.page.getByRole('link', { name: /Teams/i }).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect.soft(this.page.getByRole('link', { name: /^User$/i }).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect.soft(this.page.getByRole('link', { name: /Projects/i }).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect.soft(this.page.getByRole('link', { name: 'ClockWise', exact: true })).toBeVisible({
      timeout: 10_000,
    });
  }

  async navigateUserMenuToMyProfile(): Promise<void> {
    await this.page.getByRole('link', { name: /^User$/i }).first().click({ timeout: 15_000 });
    await this.page.getByRole('link', { name: /My Profile/i }).first().click({ timeout: 15_000 });
    await this.waitForNetworkSettled();
    await waitForFrameBody(this.content(), 20_000).catch(() => {});
  }

  async navigateClockWiseToProcedureMisses(): Promise<void> {
    await this.page.getByRole('link', { name: 'ClockWise', exact: true }).click({ timeout: 15_000 });
    await this.page.getByRole('link', { name: /ClockWise Data/i }).first().click({ timeout: 15_000 });
    await this.page.getByRole('link', { name: /Procedure Misses/i }).first().click({ timeout: 15_000 });
    await this.waitForNetworkSettled();
    await waitForFrameBody(this.content(), 25_000).catch(() => {});
  }

  /** Report grid inside nested iframe (see `details-locators.md` ClockWise → Procedure Misses). */
  procedureMissesReportGrid(): Locator {
    return this.page
      .frameLocator('iframe[name="EYEPAX_iframe"]')
      .frameLocator('iframe[name="dbifrm_widget2"]')
      .locator('table')
      .first();
  }

  /** User Profile → Request Leave area: search for My Leave History link/text. */
  async openMyLeaveHistoryFromProfile(): Promise<void> {
    await this.navigateUserMenuToMyProfile();
    const root = this.content();
    const historyLink = root.getByRole('link', { name: /My Leave History/i }).first();
    const requestLeave = root.getByRole('link', { name: /Request Leave/i }).first();
    if (await historyLink.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await historyLink.click();
    } else if (await requestLeave.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await requestLeave.click();
      const innerHistory = root.getByRole('link', { name: /My Leave History/i }).first();
      await innerHistory.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {});
      await innerHistory.click({ timeout: 15_000 }).catch(() => {});
    }
    await this.waitForNetworkSettled();
    await waitForFrameBody(this.grid(), 25_000).catch(() => {});
  }

  async expectLeaveHistoryTableLoaded(): Promise<void> {
    const gridVisible = await this.grid().locator('table').first().isVisible({ timeout: 20_000 }).catch(() => false);
    const altTable = await this.content().locator('table').first().isVisible({ timeout: 10_000 }).catch(() => false);
    expect(gridVisible || altTable).toBeTruthy();
  }
}
