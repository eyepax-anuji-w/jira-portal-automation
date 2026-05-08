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
}
