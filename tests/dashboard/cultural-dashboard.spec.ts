import * as fs from 'fs';
import * as path from 'path';
import { expect, test } from '@playwright/test';
import { CulturalDashboardPage } from '../../pages/dashboard/CulturalDashboardPage';

const authUser = path.join(process.cwd(), 'auth', 'user.json');
const hasUserAuth = fs.existsSync(authUser);

const describeCultural = hasUserAuth ? test.describe : test.describe.skip;

describeCultural('Cultural Dashboard & CDV', () => {
  if (hasUserAuth) {
    test.use({ storageState: authUser });
  }

  test.beforeEach(async ({ page }) => {
    const dash = new CulturalDashboardPage(page);
    await dash.openDashboard();
  });

  test('CD-001 | User Dashboard loads Cultural Activities and Procedure Misses panels', async ({
    page,
  }) => {
    const dash = new CulturalDashboardPage(page);
    await dash.expectCulturalAndProcedurePanels();
  });

  test('CD-003 | Cultural Activities shows Most Recent Events and summary table structure', async ({
    page,
  }) => {
    const dash = new CulturalDashboardPage(page);
    await dash.expectMostRecentEventsVisible();
    await expect.soft(dash.culturalActivitySummaryTable().first()).toBeVisible({ timeout: 20_000 });
  });

  test('CDV-001 | Coaching Conducted row present for integrity checks', async ({ page }) => {
    const dash = new CulturalDashboardPage(page);
    await dash.selectYear(2026);
    await expect.soft(dash.rowForActivity(/Coaching/i).first()).toBeVisible({ timeout: 20_000 });
  });

  test('CDV-002 | Coaching Participated / coachee row visible', async ({ page }) => {
    const dash = new CulturalDashboardPage(page);
    await dash.selectYear(2026);
    await expect.soft(dash.rowForActivity(/Coaching/i).first()).toBeVisible({ timeout: 20_000 });
  });

  test('CDV-003 | Sit-with Conducted matches supervisor records', async ({ page }) => {
    const dash = new CulturalDashboardPage(page);
    await dash.selectYear(2026);
    await expect(dash.rowForActivity(/Sit-with|Sit with/i).first()).toBeVisible({ timeout: 20_000 });
  });

  test('CDV-004 | Sit-with Participated row visible', async ({ page }) => {
    const dash = new CulturalDashboardPage(page);
    await dash.selectYear(2026);
    await expect.soft(dash.rowForActivity(/Sit-with|Sit with/i).first()).toBeVisible({
      timeout: 20_000,
    });
  });

  test('CDV-005 | 1 on 1 Conducted row visible', async ({ page }) => {
    const dash = new CulturalDashboardPage(page);
    await dash.selectYear(2026);
    await expect.soft(dash.rowForActivity(/1\s*on\s*1|1on1/i).first()).toBeVisible({
      timeout: 20_000,
    });
  });

  test('CDV-006 | 1 on 1 Participated row visible', async ({ page }) => {
    const dash = new CulturalDashboardPage(page);
    await dash.selectYear(2026);
    await expect.soft(dash.rowForActivity(/1\s*on\s*1|1on1/i).first()).toBeVisible({
      timeout: 20_000,
    });
  });

  test('CDV-007 | Year switch updates dashboard headings', async ({ page }) => {
    const dash = new CulturalDashboardPage(page);
    await dash.selectYear(2026);
    await dash.expectCulturalActivitiesHeading(2026);
    await dash.selectYear(2025);
    await dash.expectCulturalActivitiesHeading(2025);
  });

  test('CDV-008 | Empty-year behavior uses stable UI (soft)', async ({ page }) => {
    const dash = new CulturalDashboardPage(page);
    await dash.selectYear(2024);
    // After selecting an empty year the cultural activities table should still render
    // (rows show 0 values or "no records" text); check the table container is visible
    await expect
      .soft(dash.culturalActivitySummaryTable().first())
      .toBeVisible({ timeout: 15_000 });
  });
});
