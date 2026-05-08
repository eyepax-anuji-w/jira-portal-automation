import * as fs from 'fs';
import * as path from 'path';
import { expect, test } from '@playwright/test';
import { UserDashboardPage } from '../../pages/dashboard/UserDashboardPage';
import { ModuleURLs } from '../../test-data/module-urls';

const authUser = path.join(process.cwd(), 'auth', 'user.json');
const hasUserAuth = fs.existsSync(authUser);

const describeDashboard = hasUserAuth ? test.describe : test.describe.skip;

describeDashboard('User Dashboard', () => {
  if (hasUserAuth) {
    test.use({ storageState: authUser });
  }

  test.beforeEach(async ({ page }) => {
    const dash = new UserDashboardPage(page);
    await dash.openDashboard();
  });

  test('UDL-001 | User dashboard loads Current Year dropdown and Leave Summary', async ({ page }) => {
    const dash = new UserDashboardPage(page);
    await dash.expectDashboardChromeVisible();
  });

  test('UDL-002 | Current Year dropdown shows year options', async ({ page }) => {
    const dash = new UserDashboardPage(page);
    const opts = await dash.yearDropdown().locator('option').allTextContents();
    expect(opts.filter(Boolean).length).toBeGreaterThan(0);
  });

  test('UDY-003 | Select year 2026 updates Leave Summary heading', async ({ page }) => {
    const dash = new UserDashboardPage(page);
    await dash.selectYear(2026);
    await dash.expectLeaveSummaryHeading(2026);
  });

  test('UDY-004 | Select year 2025 updates Leave Summary heading', async ({ page }) => {
    const dash = new UserDashboardPage(page);
    await dash.selectYear(2025);
    await dash.expectLeaveSummaryHeading(2025);
  });

  test('UDY-005 | Select year 2024 updates Leave Summary heading', async ({ page }) => {
    const dash = new UserDashboardPage(page);
    await dash.selectYear(2024);
    await dash.expectLeaveSummaryHeading(2024);
  });

  test('UDL-003 | Selecting 2024 updates Leave Summary heading', async ({ page }) => {
    const dash = new UserDashboardPage(page);
    await dash.selectYear(2024);
    await dash.expectLeaveSummaryHeading(2024);
  });

  test('UDL-004 | Selecting 2026 updates Leave Summary heading', async ({ page }) => {
    const dash = new UserDashboardPage(page);
    await dash.selectYear(2026);
    await dash.expectLeaveSummaryHeading(2026);
  });

  test('UDL-005 | Selecting 2025 updates Leave Summary heading', async ({ page }) => {
    const dash = new UserDashboardPage(page);
    await dash.selectYear(2025);
    await dash.expectLeaveSummaryHeading(2025);
  });

  test('UDY-009 | Switching years repeatedly keeps Leave Summary heading consistent', async ({ page }) => {
    const dash = new UserDashboardPage(page);
    for (const y of [2026, 2025, 2024, 2026]) {
      await dash.selectYear(y);
      await dash.expectLeaveSummaryHeading(y);
    }
  });

  test('UDL-006 | Notice Summary shows No Records Found when no notice data (year 2024)', async ({
    page,
  }) => {
    const dash = new UserDashboardPage(page);
    await dash.selectYear(2024);
    await expect
      .soft(dash.leaveSummaryFrame().getByText(/No Records Found/i).first())
      .toBeVisible({ timeout: 25_000 });
  });

  test('UDL-007 | Notice Summary column group headers render when data exists', async ({ page }) => {
    const dash = new UserDashboardPage(page);
    await dash.selectYear(2026);
    await dash.expectNoticeSummaryHeadersVisible();
  });

  test('TC-LEAVE-007 | Notice Summary column headers and year sub-columns', async ({ page }) => {
    const dash = new UserDashboardPage(page);
    await dash.selectYear(2025);
    await dash.expectNoticeSummaryHeadersVisible();
    await dash.expectNoticeYearColumnHeaders(2025);
  });

  test('UDL-008 / TC-LEAVE-009 | Leave type rows include expected types', async ({ page }) => {
    const dash = new UserDashboardPage(page);
    await dash.selectYear(2026);
    await dash.expectLeaveTypeRowsPresent(['Casual', 'Annual', 'Medical', 'Lieu', 'No-Pay']);
  });

  test('UDL-009 | Year change refreshes Notice Summary year column headers', async ({ page }) => {
    const dash = new UserDashboardPage(page);
    await dash.selectYear(2026);
    await dash.expectNoticeYearColumnHeaders(2026);
    await dash.selectYear(2025);
    await dash.expectNoticeYearColumnHeaders(2025);
  });

  test('UDL-010 | Rapid year switching does not break Notice Summary', async ({ page }) => {
    const dash = new UserDashboardPage(page);
    for (const y of [2024, 2026, 2025, 2024]) {
      await dash.selectYear(y);
      await dash.expectLeaveSummaryHeading(y);
      await expect(dash.noticeSummaryHeading()).toBeVisible({ timeout: 20_000 });
    }
  });

  test('UDL-011 | Current year selection is consistent after page refresh', async ({ page }) => {
    const dash = new UserDashboardPage(page);
    await dash.selectYear(2025);
    await dash.expectLeaveSummaryHeading(2025);
    await page.reload({ waitUntil: 'networkidle' });
    const value = await dash.yearDropdown().inputValue();
    expect(value).toBe('2025');
    await dash.expectLeaveSummaryHeading(2025);
  });

  test('TC-LEAVE-002 | Top navigation links are visible', async ({ page }) => {
    const dash = new UserDashboardPage(page);
    await dash.expectTopNavLinksVisible();
  });

  test('TC-LEAVE-005 | Upcoming leaves banner or pending message is visible', async ({ page }) => {
    const dash = new UserDashboardPage(page);
    await dash.expectUpcomingLeavesAreaVisible();
  });

  test('TC-LEAVE-010 | User Profile button navigates away from dashboard', async ({ page }) => {
    const dash = new UserDashboardPage(page);
    await dash.clickUserProfileButton();
    await expect(
      page.frameLocator('iframe[name="EYEPAX_iframe"]').getByText(/profile|leave|request/i).first(),
    ).toBeVisible({ timeout: 25_000 });
  });

  test('TC-LEAVE-011 | Cultural Dashboard button shows Cultural Activities panel', async ({
    page,
  }) => {
    const dash = new UserDashboardPage(page);
    await dash.clickCulturalDashboardButton();
    await expect(
      dash.culturalActivitiesFrame().getByText(/CULTURAL ACTIVITIES/i).first(),
    ).toBeVisible({ timeout: 25_000 });
  });

  test('TC-LEAVE-020 | Leave type link opens popup with Close control', async ({ page }) => {
    const dash = new UserDashboardPage(page);
    await dash.selectYear(2026);
    const casual = dash.leaveTypeLink(/^Casual$/i).first();
    await casual.click({ timeout: 15_000 });
    await expect(dash.popupFrame().getByText('Close', { exact: true }).first()).toBeVisible({
      timeout: 20_000,
    });
    await dash.closePopup();
  });

  test('TC-LEAVE-012 (partial) | My Leave History grid loads from profile navigation', async ({
    page,
  }) => {
    const dash = new UserDashboardPage(page);
    await dash.openMyLeaveHistoryFromProfile();
    await dash.expectLeaveHistoryTableLoaded();
  });

  test('PMD-001 (partial) | Procedure Misses report opens from ClockWise menu', async ({
    page,
  }) => {
    const dash = new UserDashboardPage(page);
    await dash.navigateClockWiseToProcedureMisses();
    await expect.soft(dash.procedureMissesReportGrid()).toBeVisible({ timeout: 30_000 });
  });
});

/** Does not require `auth/user.json`; verifies unauthenticated access is rejected or redirected. */
test.describe('User Dashboard — authorization', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('UDL-013 | Dashboard is not accessible when logged out', async ({ page }) => {
    await page.goto(ModuleURLs.eyepaxRoot);
    const loginByUrl = /app_login|login/i.test(page.url());
    const loginForm = await page.locator('#inputEmail').isVisible({ timeout: 10_000 }).catch(() => false);
    const invalidOrDenied = await page.getByText(/invalid|sign in|access denied/i).first().isVisible({ timeout: 5_000 }).catch(() => false);
    expect(loginByUrl || loginForm || invalidOrDenied).toBeTruthy();
  });
});
