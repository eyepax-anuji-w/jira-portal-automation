import type { Locator } from '@playwright/test';
import { expect } from '@playwright/test';
import { ModuleURLs } from '../../test-data/module-urls';
import { waitForFrameBody } from '../../utils/frame-helper';
import { UserDashboardPage } from './UserDashboardPage';

/**
 * Cultural Activities & Procedure Misses panels.
 * Stays on the default Cultural Dashboard view (no "User Dashboard" navigation).
 */
export class CulturalDashboardPage extends UserDashboardPage {
  // In Cultural mode the year-select lives in widget10 (not widget6)
  override yearDropdown() {
    return this.controlsFrame().locator('#year-select');
  }

  // Override: do NOT click "User Dashboard" — widget8 here shows Cultural Activities
  async openDashboard(): Promise<void> {
    await this.page.goto(ModuleURLs.eyepaxRoot);
    await this.page.waitForLoadState('networkidle').catch(() => {});

    if (await this._isInvalidDataShown()) {
      await this._freshLogin();
    }

    await waitForFrameBody(this.content(), 20_000).catch(() => {});
    await waitForFrameBody(this.culturalActivitiesFrame(), 25_000).catch(() => {});
    await this.waitForNetworkSettled();
  }

  async expectCulturalAndProcedurePanels(): Promise<void> {
    await expect
      .soft(this.culturalActivitiesFrame().getByText(/CULTURAL ACTIVITIES/i).first())
      .toBeVisible({ timeout: 25_000 });
    await expect
      .soft(this.procedureMissesFrame().getByText(/PROCEDURE MISSES/i).first())
      .toBeVisible({ timeout: 25_000 });
  }

  async expectMostRecentEventsVisible(): Promise<void> {
    await expect(
      this.culturalActivitiesFrame().getByText(/MOST RECENT EVENTS/i).first(),
    ).toBeVisible({ timeout: 25_000 });
  }

  culturalActivitySummaryTable() {
    return this.culturalActivitiesFrame()
      .locator('table')
      .filter({ hasText: /Conducted|Participated|Expected/i });
  }

  rowForActivity(name: string | RegExp) {
    return this.culturalActivitiesFrame().locator('tr').filter({ hasText: name });
  }

  topThreeSection(): Locator {
    return this.procedureMissesFrame().getByText(/Top 3 types/i).first();
  }

  monthlyStripHeaders(): Locator {
    return this.procedureMissesFrame().getByRole('columnheader', { name: 'JAN' }).first();
  }

  procedureMissesSummaryYearHeader(year: number): Locator {
    return this.procedureMissesFrame().getByRole('columnheader', { name: String(year) });
  }

  culturalSummaryYearCell(year: number): Locator {
    return this.culturalActivitiesFrame().getByRole('cell', { name: String(year), exact: true });
  }

  /** Month tile on the Procedure Misses heatmap (title often full month name, e.g. APRIL). */
  procedureMissesMonthTile(monthTitle: string): Locator {
    return this.procedureMissesFrame().getByTitle(monthTitle, { exact: false });
  }

  /**
   * Opens procedure-miss detail popup by clicking a non-zero month tile when present,
   * otherwise clicks JAN header cell as smoke (may show 0 records detail).
   */
  async openProcedureMissesMonthDetail(): Promise<void> {
    const w9 = this.procedureMissesFrame();
    const titled = w9.locator('[title]').filter({ hasNotText: /^$/ });
    const count = await titled.count();
    let clicked = false;
    for (let i = 0; i < Math.min(count, 40); i++) {
      const el = titled.nth(i);
      const t = await el.getAttribute('title').catch(() => '');
      if (t && /JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|MONTH/i.test(t)) {
        await el.click({ timeout: 10_000 }).catch(() => {});
        clicked = true;
        break;
      }
    }
    if (!clicked) {
      await w9.getByRole('columnheader', { name: 'JAN' }).first().click({ timeout: 10_000 }).catch(() => {});
    }
    await this.popupFrame().locator('body').waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {});
  }

  async navigateToMyProfile(): Promise<void> {
    await this.navigateUserMenuToMyProfile();
  }

  treeMenuProfileFrame() {
    return this.page
      .frameLocator('iframe[name="EYEPAX_iframe"]')
      .frameLocator('iframe[name="treemenu_user_card_iframe"]');
  }

  async openCoachingSessionsAsCoach(): Promise<void> {
    await this.navigateToMyProfile();
    await this.page
      .frameLocator('iframe[name="EYEPAX_iframe"]')
      .getByRole('link', { name: /Coaching Sessions/i })
      .first()
      .click({ timeout: 20_000 });
    await this.waitForNetworkSettled();
    await waitForFrameBody(this.treeMenuProfileFrame(), 25_000).catch(() => {});
    await this.treeMenuProfileFrame().getByRole('link', { name: /As a Coach/i }).first().click({
      timeout: 20_000,
    });
    await this.waitForNetworkSettled();
  }

  async openCoachingSessionsAsCoachee(): Promise<void> {
    await this.navigateToMyProfile();
    await this.page
      .frameLocator('iframe[name="EYEPAX_iframe"]')
      .getByRole('link', { name: /Coaching Sessions/i })
      .first()
      .click({ timeout: 20_000 });
    await this.waitForNetworkSettled();
    await waitForFrameBody(this.treeMenuProfileFrame(), 25_000).catch(() => {});
    await this.treeMenuProfileFrame().getByRole('link', { name: /As a Coachee/i }).first().click({
      timeout: 20_000,
    });
    await this.waitForNetworkSettled();
  }

  async openSitWithAsSupervisor(): Promise<void> {
    await this.navigateToMyProfile();
    await this.page
      .frameLocator('iframe[name="EYEPAX_iframe"]')
      .getByRole('link', { name: /Sit-with|Sit with/i })
      .first()
      .click({ timeout: 20_000 });
    await this.waitForNetworkSettled();
    await waitForFrameBody(this.treeMenuProfileFrame(), 25_000).catch(() => {});
    await this.treeMenuProfileFrame().getByRole('link', { name: /As a Supervisor/i }).first().click({
      timeout: 20_000,
    });
    await this.waitForNetworkSettled();
  }

  async openSitWithAsParticipant(): Promise<void> {
    await this.navigateToMyProfile();
    await this.page
      .frameLocator('iframe[name="EYEPAX_iframe"]')
      .getByRole('link', { name: /Sit-with|Sit with/i })
      .first()
      .click({ timeout: 20_000 });
    await this.waitForNetworkSettled();
    await waitForFrameBody(this.treeMenuProfileFrame(), 25_000).catch(() => {});
    await this.treeMenuProfileFrame().getByRole('link', { name: /As a Participant/i }).first().click({
      timeout: 20_000,
    });
    await this.waitForNetworkSettled();
  }

  async openOneOnOneAsSupervisor(): Promise<void> {
    await this.navigateToMyProfile();
    await this.page
      .frameLocator('iframe[name="EYEPAX_iframe"]')
      .getByRole('link', { name: /on 1 Meetings|1 on 1/i })
      .first()
      .click({ timeout: 20_000 });
    await this.waitForNetworkSettled();
    await waitForFrameBody(this.treeMenuProfileFrame(), 25_000).catch(() => {});
    await this.treeMenuProfileFrame().getByRole('link', { name: /As a Supervisor/i }).first().click({
      timeout: 15_000,
    });
    await this.waitForNetworkSettled();
  }

  async openOneOnOneAsParticipant(): Promise<void> {
    await this.navigateToMyProfile();
    await this.page
      .frameLocator('iframe[name="EYEPAX_iframe"]')
      .getByRole('link', { name: /on 1 Meetings|1 on 1/i })
      .first()
      .click({ timeout: 20_000 });
    await this.waitForNetworkSettled();
    await waitForFrameBody(this.treeMenuProfileFrame(), 25_000).catch(() => {});
    await this.treeMenuProfileFrame().getByRole('link', { name: /As a Participant/i }).first().click({
      timeout: 15_000,
    });
    await this.waitForNetworkSettled();
  }

  coachingGridRowCount(): Locator {
    return this.treeMenuProfileFrame().locator('table').first();
  }

  /**
   * Best-effort: first numeric cell in the Cultural Activity Summary row for `activity`.
   * Used only for soft comparisons with profile grids (pagination may differ).
   */
  async readFirstNumericFromActivityRow(activity: RegExp): Promise<number | null> {
    const text = await this.rowForActivity(activity).first().innerText({ timeout: 20_000 }).catch(() => '');
    const nums = text.match(/\d+(?:\.\d+)?/g);
    if (!nums?.length) return null;
    return Number(nums[0]);
  }
}
