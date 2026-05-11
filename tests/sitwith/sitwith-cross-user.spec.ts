/**
 * Cross-user sit-with test.
 *
 * Two browser contexts run inside a single test:
 *   - contextA → chamith.d  (Senior Manager / Supervisor)  auth/supervisor.json
 *   - contextB → dulmi.j    (Team Lead / Participant)       auth/admin.json
 *
 * Flow (3 phases):
 *   Phase 1 (parallel login):
 *     chamith.d: dashboard → "User Dashboard" mode → widget6 "User Profile" → Sit-with page
 *     dulmi.j:   dashboard → Users → My Profile → Sit-with page
 *     Both arrive at their Sit-with page simultaneously.
 *   Phase 2 (chamith.d creates):
 *     Supervisor grid → Add New → fill form (dulmi as coachee) → save.
 *   Phase 3 (dulmi.j verifies):
 *     Reload + navigate back to Sit-with (grid does not auto-refresh) →
 *     "As a Supervisor" → "As a Participant" → assert title in participant grid.
 *
 * Iframe nesting (confirmed from screenshot + codegen):
 *   EYEPAX_iframe
 *     ├─ Sit-with link  (left sidebar — outer page structure for chamith.d)
 *     └─ treemenu_user_card_iframe
 *          ├─ nm_iframe_aba_grid_sitwithNote_as_supervisor_1  (chamith.d's grid)
 *          │    └─ TB_iframeContent<N>  (Add New modal, N is session-dynamic)
 *          └─ nm_iframe_aba_grid_sitwithNote_as_participant_1 (dulmi.j's grid)
 */

import * as fs from 'fs';
import * as path from 'path';
import { test, expect, type Page } from '@playwright/test';

const authSupervisor = path.join(process.cwd(), 'auth', 'supervisor.json');
const authAdmin = path.join(process.cwd(), 'auth', 'admin.json');

const hasBothSessions = fs.existsSync(authSupervisor) && fs.existsSync(authAdmin);

const describeCrossUser = hasBothSessions ? test.describe : test.describe.skip;

/**
 * Navigates to the app root and checks that EYEPAX_iframe is loaded.
 * EYEPAX_iframe is the universal dashboard indicator — present for every role.
 * If it is not visible (session expired or mood popup blocking), performs a fresh login.
 */
async function ensureOnDashboard(
  page: Page,
  userId: string,
  password: string,
): Promise<void> {
  await page.goto('/EYEPAX/');
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForLoadState('networkidle').catch(() => {});

  const iframeVisible = await page
    .locator('iframe[name="EYEPAX_iframe"]')
    .isVisible({ timeout: 8_000 })
    .catch(() => false);

  if (!iframeVisible) {
    const loginPath = process.env.E2E_LOGIN_PATH ?? '/app_login/';
    await page.goto(loginPath);
    await page.waitForLoadState('domcontentloaded');
    await page.locator('#inputEmail').fill(userId);
    await page.locator('#inputPassword').fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForLoadState('networkidle').catch(() => {});

    // Dismiss mood popup if present
    const moodVisible = await page
      .getByText(/How Are You Feeling/i)
      .isVisible({ timeout: 5_000 })
      .catch(() => false);
    if (moodVisible) {
      await page
        .locator('img[alt*="Happy" i], img[title*="Happy" i]')
        .first()
        .click()
        .catch(() => {});
      await page
        .getByText(/How Are You Feeling/i)
        .waitFor({ state: 'hidden', timeout: 15_000 })
        .catch(() => {});
      await page.waitForLoadState('networkidle').catch(() => {});
    }
  }

  // Universal readiness check — every role has EYEPAX_iframe after login
  await page
    .locator('iframe[name="EYEPAX_iframe"]')
    .waitFor({ state: 'visible', timeout: 30_000 });
}

/**
 * Navigates to the current user's My Profile page.
 *
 * Strategy (tried in order, using waitFor so it actually waits):
 *   1. "Users" top-nav link — Team Lead / admin roles
 *   2. widget6 "User Profile" button — Senior Manager role
 */
async function navigateToMyProfile(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded').catch(() => {});

  // Path 1 — "Users" top-nav link (dulmi.j / Team Lead)
  try {
    await page.getByRole('link', { name: 'Users' }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('link', { name: 'Users' }).click();
    await page.getByRole('link', { name: 'My Profile' }).click();
    await page.waitForLoadState('networkidle').catch(() => {});
    return;
  } catch {
    // "Users" not in nav — fall through to widget6 path
  }

  // Path 2 — widget6 "User Profile" button (chamith.d / Senior Manager).
  // We are already on the dashboard from ensureOnDashboard — do NOT goto again.
  // widget6 only renders after switching to "User Dashboard" mode.
  // Try two sub-paths: (a) "User Dashboard" button directly in EYEPAX_iframe,
  // then (b) "User Dashboard" inside dbifrm_widget10.
  const eyepax = page.locator('iframe[name="EYEPAX_iframe"]').contentFrame();

  // Sub-path (a): direct button in EYEPAX_iframe (works for some role layouts)
  const userDashBtn = eyepax.getByRole('button', { name: 'User Dashboard' });
  const userDashVisible = await userDashBtn.isVisible({ timeout: 3_000 }).catch(() => false);
  if (userDashVisible) {
    await userDashBtn.click();
    await page.waitForLoadState('networkidle').catch(() => {});
  } else {
    // Sub-path (b): button inside dbifrm_widget10
    const widget10Iframe = eyepax.locator('iframe[name="dbifrm_widget10"]');
    await widget10Iframe.waitFor({ state: 'visible', timeout: 20_000 });
    const widget10 = widget10Iframe.contentFrame();
    await widget10.getByRole('button', { name: 'User Dashboard' }).waitFor({ state: 'visible', timeout: 15_000 });
    await widget10.getByRole('button', { name: 'User Dashboard' }).click();
    await page.waitForLoadState('networkidle').catch(() => {});
  }

  // Now widget6 is rendered — click "User Profile"
  const widget6Iframe = eyepax.locator('iframe[name="dbifrm_widget6"]');
  await widget6Iframe.waitFor({ state: 'visible', timeout: 20_000 });
  const widget6 = widget6Iframe.contentFrame();
  await widget6.getByRole('button', { name: 'User Profile' }).waitFor({ state: 'visible', timeout: 15_000 });
  await widget6.getByRole('button', { name: 'User Profile' }).click();
  await page.waitForLoadState('networkidle').catch(() => {});
}

/**
 * After another user creates a sit-with, dulmi's grid does not auto-refresh.
 * Reload, return to Sit-with, then follow the tab order from details-locators:
 * "As a Supervisor" → "As a Participant" so the participant iframe loads fresh data.
 */
async function reloadAndOpenDulmiParticipantGrid(
  page: Page,
  teamLeadId: string,
  teamLeadPw: string,
): Promise<void> {
  await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForLoadState('networkidle').catch(() => {});

  const iframeOk = await page
    .locator('iframe[name="EYEPAX_iframe"]')
    .isVisible({ timeout: 10_000 })
    .catch(() => false);
  if (!iframeOk) {
    await ensureOnDashboard(page, teamLeadId, teamLeadPw);
  } else {
    await page.locator('iframe[name="EYEPAX_iframe"]').waitFor({ state: 'visible', timeout: 30_000 });
  }

  await navigateToMyProfile(page);

  const eyepax = page.locator('iframe[name="EYEPAX_iframe"]').contentFrame();
  await eyepax.getByRole('link', { name: 'Sit-with' }).waitFor({ state: 'visible', timeout: 20_000 });
  await eyepax.getByRole('link', { name: 'Sit-with' }).click();
  await page.waitForLoadState('networkidle').catch(() => {});

  const treemenuIframe = eyepax.locator('iframe[name="treemenu_user_card_iframe"]');
  await treemenuIframe.waitFor({ state: 'visible', timeout: 25_000 });
  const userCard = treemenuIframe.contentFrame();

  await userCard.getByRole('link', { name: 'As a Supervisor' }).waitFor({ state: 'visible', timeout: 15_000 });
  await userCard.getByRole('link', { name: 'As a Supervisor' }).click();
  await page.waitForLoadState('networkidle').catch(() => {});

  await userCard.getByRole('link', { name: 'As a Participant' }).waitFor({ state: 'visible', timeout: 15_000 });
  await userCard.getByRole('link', { name: 'As a Participant' }).click();
  await page.waitForLoadState('networkidle').catch(() => {});

  // Wait until the participant grid iframe is attached (assertions use page.frameLocator below).
  await page
    .frameLocator('iframe[name="EYEPAX_iframe"]')
    .frameLocator('iframe[name="treemenu_user_card_iframe"]')
    .frameLocator('iframe[name="nm_iframe_aba_grid_sitwithNote_as_participant_1"]')
    .locator('body')
    .waitFor({ state: 'attached', timeout: 20_000 })
    .catch(() => {});
}

describeCrossUser('Sit-With — Cross-User', () => {
  test('SW-CU-001 | Senior Manager creates sit-with — Team Lead sees it in their Participant tab', async ({
    browser,
  }) => {
    test.setTimeout(300_000); // 5 min — two-browser cross-user flow with iframe nesting

    const baseURL = process.env.BASE_URL ?? 'https://jira2-stage.eyepax.info';
    const supervisorId = process.env.E2E_SUPERVISOR_ID ?? '';
    const supervisorPw = process.env.E2E_SUPERVISOR_PASSWORD ?? '';
    const teamLeadId = process.env.E2E_ADMIN_ID ?? '';
    const teamLeadPw = process.env.E2E_ADMIN_PASSWORD ?? '';

    // Unique title so we can identify exactly this record in dulmi.j's view
    const sitwithTitle = `Auto-SW-${Date.now()}`;

    // ── PHASE 1 (parallel): open both browsers, log in, navigate to Sit-with ─
    const [contextA, contextB] = await Promise.all([
      browser.newContext({ storageState: authSupervisor, baseURL }),
      browser.newContext({ storageState: authAdmin, baseURL }),
    ]);
    const [pageA, pageB] = await Promise.all([
      contextA.newPage(),
      contextB.newPage(),
    ]);

    // Both browsers reach the dashboard simultaneously
    await Promise.all([
      ensureOnDashboard(pageA, supervisorId, supervisorPw),
      ensureOnDashboard(pageB, teamLeadId, teamLeadPw),
    ]);

    // Navigate to My Profile sequentially — avoids server load contention
    // that causes the "Users" nav-link visibility check to time out for one user
    await navigateToMyProfile(pageA);
    await navigateToMyProfile(pageB);

    // Both browsers click "Sit-with" in their EYEPAX_iframe left sidebar simultaneously
    const eyepaxA = pageA.locator('iframe[name="EYEPAX_iframe"]').contentFrame();
    const eyepaxB = pageB.locator('iframe[name="EYEPAX_iframe"]').contentFrame();

    // chamith.d clicks Sit-with first (sequential — his page state is more complex)
    await eyepaxA.getByRole('link', { name: 'Sit-with' }).waitFor({ state: 'visible', timeout: 20_000 });
    await eyepaxA.getByRole('link', { name: 'Sit-with' }).click();
    await pageA.waitForLoadState('networkidle').catch(() => {});

    // dulmi.j clicks Sit-with (her "Users → My Profile" path is simpler)
    await eyepaxB.getByRole('link', { name: 'Sit-with' }).waitFor({ state: 'visible', timeout: 20_000 });
    await eyepaxB.getByRole('link', { name: 'Sit-with' }).click();
    await pageB.waitForLoadState('networkidle').catch(() => {});

    // ── PHASE 2 (sequential): chamith.d creates the sit-with ─────────────────
    const treemenuIframeA = eyepaxA.locator('iframe[name="treemenu_user_card_iframe"]');
    await treemenuIframeA.waitFor({ state: 'visible', timeout: 25_000 });
    const userCardA = treemenuIframeA.contentFrame();

    // Click "As a Supervisor" tab so the supervisor grid loads
    await userCardA.getByRole('link', { name: 'As a Supervisor' }).waitFor({ state: 'visible', timeout: 15_000 });
    await userCardA.getByRole('link', { name: 'As a Supervisor' }).click();
    await pageA.waitForLoadState('networkidle').catch(() => {});

    const supervisorGrid = userCardA
      .locator('iframe[name="nm_iframe_aba_grid_sitwithNote_as_supervisor_1"]')
      .contentFrame();
    await supervisorGrid.getByText('Add New').waitFor({ state: 'visible', timeout: 25_000 });
    await supervisorGrid.getByText('Add New').click();
    await pageA.waitForLoadState('networkidle').catch(() => {});

    // TB_iframeContent<N> — N is session-dynamic, so match by prefix rather than exact name.
    const modalIframe = supervisorGrid.locator('iframe[name^="TB_iframeContent"]');
    await modalIframe.waitFor({ state: 'visible', timeout: 20_000 });
    const modal = modalIframe.contentFrame();

    await modal.locator('#input_title').waitFor({ state: 'visible', timeout: 20_000 });
    await modal.locator('#input_title').fill(sitwithTitle);
    await modal.locator('#input_description').fill('Automated cross-user sit-with test');

    await modal.locator('#input_date').click();
    await modal.getByRole('link', { name: '15' }).click();
    await modal.locator('#input_startTime').selectOption('13:00');
    await modal.locator('#input_duration').selectOption('01:30');
    await modal.locator('#input_projectId').selectOption({ index: 1 });
    await modal.locator('#input_location').selectOption({ index: 1 });
    await modal.locator('#input_isBillable').nth(1).check();
    await modal.locator('#input_isCoach').selectOption('1');

    // Select dulmi.j as the coachee — browser B is already on her Sit-with page waiting
    const dulmiValue = await modal
      .locator('#input_coach option')
      .filter({ hasText: /dulmi/i })
      .first()
      .getAttribute('value');
    await modal.locator('#input_coach').selectOption(dulmiValue ?? { index: 1 });

    // Save — dispatchEvent bypasses the "outside of viewport" issue inside the iframe
    await modal.getByRole('button', { name: 'Add' }).dispatchEvent('click');
    await pageA.waitForLoadState('networkidle').catch(() => {});

    // "Record added" — OK is on the top-level page (SweetAlert2), not inside the Add modal iframe.
    try {
      await pageA.getByRole('button', { name: 'OK' }).click({ timeout: 10_000 });
    } catch {
      try {
        await pageA.locator('.swal2-confirm').click({ timeout: 5_000 });
      } catch {
        const swal = modal.locator('.swal2-container');
        await swal.waitFor({ state: 'visible', timeout: 4_000 }).catch(() => {});
        await modal.locator('.swal2-confirm').dispatchEvent('click').catch(() => {});
      }
    }

    // Wait for the modal iframe to fully close (auto-close or after swal confirm)
    await modalIframe.waitFor({ state: 'hidden', timeout: 15_000 }).catch(async () => {
      // If still open after 15 s, force-close it
      await modal.getByRole('button', { name: 'Close' }).dispatchEvent('click').catch(() => {});
    });
    await pageA.waitForLoadState('networkidle').catch(() => {});

    // Confirm the new record appears in chamith.d's supervisor grid
    await expect(supervisorGrid.getByText(sitwithTitle)).toBeVisible({ timeout: 20_000 });

    // ── PHASE 3 (sequential): dulmi.j verifies the sit-with is visible ────────
    // Her grid was loaded *before* chamith saved — Scriptcase does not push updates.
    // Reload, return to Sit-with, then tab order: As a Supervisor → As a Participant.
    await reloadAndOpenDulmiParticipantGrid(pageB, teamLeadId, teamLeadPw);

    // Assert via page.frameLocator chain — matches Playwright trace snapshots (title is a link).
    // Deep FrameLocator from .contentFrame() chains sometimes misses the same DOM.
    const dulmiParticipantGrid = pageB
      .frameLocator('iframe[name="EYEPAX_iframe"]')
      .frameLocator('iframe[name="treemenu_user_card_iframe"]')
      .frameLocator('iframe[name="nm_iframe_aba_grid_sitwithNote_as_participant_1"]');

    await expect(dulmiParticipantGrid.getByRole('link', { name: sitwithTitle, exact: true })).toBeVisible({
      timeout: 45_000,
    });

    // ── Clean up ──────────────────────────────────────────────────────────────
    await Promise.all([contextA.close(), contextB.close()]);
  });
});
