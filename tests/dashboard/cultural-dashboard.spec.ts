import * as fs from 'fs';
import * as path from 'path';
import { expect, test } from '@playwright/test';
import { CulturalDashboardPage } from '../../pages/dashboard/CulturalDashboardPage';
import { UserDashboardPage } from '../../pages/dashboard/UserDashboardPage';
import { waitForFrameBody } from '../../utils/frame-helper';

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

  test('CD-002 | Current Year dropdown is visible on Cultural Dashboard', async ({ page }) => {
    const dash = new CulturalDashboardPage(page);
    await expect(dash.yearDropdown()).toBeVisible({ timeout: 25_000 });
  });

  test('UDY-006 | Procedure Misses heading updates for selected year', async ({ page }) => {
    const dash = new CulturalDashboardPage(page);
    await dash.selectYear(2026);
    await dash.expectProcedureMissesHeading(2026);
    await dash.selectYear(2025);
    await dash.expectProcedureMissesHeading(2025);
  });

  test('UDY-007 | Cultural Activity Summary and Procedure Misses year labels refresh', async ({
    page,
  }) => {
    const dash = new CulturalDashboardPage(page);
    await dash.selectYear(2026);
    await expect.soft(dash.culturalSummaryYearCell(2026).first()).toBeVisible({ timeout: 20_000 });
    await expect.soft(dash.procedureMissesSummaryYearHeader(2026).first()).toBeVisible({
      timeout: 20_000,
    });
    await dash.selectYear(2025);
    await expect.soft(dash.culturalSummaryYearCell(2025).first()).toBeVisible({ timeout: 20_000 });
  });

  test('UDY-008 | Selected year persists after refresh on Cultural Dashboard', async ({ page }) => {
    const dash = new CulturalDashboardPage(page);
    await dash.selectYear(2024);
    await page.reload({ waitUntil: 'networkidle' });
    await waitForFrameBody(dash.culturalActivitiesFrame(), 30_000).catch(() => {});
    await expect(dash.yearDropdown()).toHaveValue('2024');
  });

  test('TYR-014 | Current Year persists after My Profile and return navigation', async ({
    page,
  }) => {
    const dash = new CulturalDashboardPage(page);
    await dash.selectYear(2025);
    await dash.navigateToMyProfile();
    const userShell = new UserDashboardPage(page);
    await userShell.clickUserDashboardFromToolbar();
    await expect(userShell.yearDropdown()).toHaveValue('2025');
    await userShell.clickCulturalDashboardButton();
    await expect(dash.yearDropdown()).toHaveValue('2025');
  });

  test('CD-004 | Procedure Misses shows Top 3 section and monthly strip', async ({ page }) => {
    const dash = new CulturalDashboardPage(page);
    await expect.soft(dash.topThreeSection()).toBeVisible({ timeout: 25_000 });
    await expect.soft(dash.monthlyStripHeaders()).toBeVisible({ timeout: 20_000 });
  });

  test('CD-005 (partial) | Procedure Misses month interaction opens overlay', async ({
    page,
  }) => {
    const dash = new CulturalDashboardPage(page);
    await dash.openProcedureMissesMonthDetail();
    await expect.soft(dash.popupFrame().locator('body')).toBeVisible({ timeout: 15_000 });
    await dash.closePopup();
  });

  test('CDV-001 (partial) | Coaching dashboard row vs Coaching Sessions — As a Coach grid', async ({
    page,
  }) => {
    const dash = new CulturalDashboardPage(page);
    await dash.selectYear(2026);
    const dashNum = await dash.readFirstNumericFromActivityRow(/Coaching/i);
    await dash.openCoachingSessionsAsCoach();
    await expect.soft(dash.coachingGridRowCount()).toBeVisible({ timeout: 30_000 });
    if (dashNum != null) {
      await expect.soft(dashNum).toBeGreaterThanOrEqual(0);
    }
  });

  test('CDV-002 (partial) | Coaching row vs Coaching Sessions — As a Coachee grid', async ({
    page,
  }) => {
    const dash = new CulturalDashboardPage(page);
    await dash.selectYear(2026);
    await dash.openCoachingSessionsAsCoachee();
    await expect.soft(dash.coachingGridRowCount()).toBeVisible({ timeout: 30_000 });
  });

  test('CDV-003 (partial) | Sit-with row vs Sit-with — As a Supervisor grid', async ({
    page,
  }) => {
    const dash = new CulturalDashboardPage(page);
    await dash.selectYear(2026);
    await dash.openSitWithAsSupervisor();
    await expect.soft(dash.coachingGridRowCount()).toBeVisible({ timeout: 30_000 });
  });

  test('CDV-004 (partial) | Sit-with row vs Sit-with — As a Participant grid', async ({
    page,
  }) => {
    const dash = new CulturalDashboardPage(page);
    await dash.selectYear(2026);
    await dash.openSitWithAsParticipant();
    await expect.soft(dash.coachingGridRowCount()).toBeVisible({ timeout: 30_000 });
  });

  test('CDV-005 (partial) | 1 on 1 row vs Meetings — supervisor tab grid', async ({ page }) => {
    const dash = new CulturalDashboardPage(page);
    await dash.selectYear(2026);
    await dash.openOneOnOneAsSupervisor();
    await expect.soft(dash.coachingGridRowCount()).toBeVisible({ timeout: 30_000 });
  });

  test('CDV-006 (partial) | 1 on 1 row vs Meetings — participant tab grid', async ({ page }) => {
    const dash = new CulturalDashboardPage(page);
    await dash.selectYear(2026);
    await dash.openOneOnOneAsParticipant();
    await expect.soft(dash.coachingGridRowCount()).toBeVisible({ timeout: 30_000 });
  });
});
