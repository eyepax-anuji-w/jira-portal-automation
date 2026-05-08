import * as fs from 'fs';
import * as path from 'path';
import { expect, test } from '@playwright/test';
import { UserDashboardPage } from '../../pages/dashboard/UserDashboardPage';

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
});
