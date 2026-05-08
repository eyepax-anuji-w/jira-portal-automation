import type { FrameLocator, Page } from '@playwright/test';

/**
 * Scriptcase wraps the entire app in iframe[name="EYEPAX_iframe"].
 * The dashboard splits content across per-widget sub-frames (dbifrm_widget*).
 * Centralize chains here so republish updates happen in one file.
 */
export function frameApp(page: Page): FrameLocator {
  return page.frameLocator('iframe[name="EYEPAX_iframe"]');
}

export function frameMenu(page: Page): FrameLocator {
  return frameApp(page).frameLocator('#ifrMenu');
}

export function frameContent(page: Page): FrameLocator {
  return frameApp(page).frameLocator('#ifrContent');
}

export function frameGrid(page: Page): FrameLocator {
  return frameContent(page).frameLocator('#ifrGrid');
}

// Dashboard widget frames — confirmed via Playwright codegen (details-locators.md).
//
// Cultural Dashboard view (default):
//   widget8  = Cultural Activities
//   widget9  = Procedure Misses
//   widget10 = controls: #year-select + "User Dashboard" + "User Profile" buttons
//
// User Dashboard view (after clicking "User Dashboard" in widget10):
//   widget6  = controls: #year-select + "Cultural Dashboard" + "User Profile" buttons
//   widget7  = Leave Summary

// Leave Summary — visible only after clicking "User Dashboard" in widget10
export function frameLeaveSummary(page: Page): FrameLocator {
  return frameApp(page).frameLocator('iframe[name="dbifrm_widget7"]');
}

// Cultural Activities — visible in the default Cultural Dashboard view
export function frameCulturalActivities(page: Page): FrameLocator {
  return frameApp(page).frameLocator('iframe[name="dbifrm_widget8"]');
}

// Procedure Misses — visible in the default Cultural Dashboard view
export function frameProcedureMisses(page: Page): FrameLocator {
  return frameApp(page).frameLocator('iframe[name="dbifrm_widget9"]');
}

// Persistent top-bar controls: #year-select, "User Dashboard" button, "User Profile" button
export function frameControls(page: Page): FrameLocator {
  return frameApp(page).frameLocator('iframe[name="dbifrm_widget10"]');
}

// User Dashboard nav widget: "User Profile" / "Cultural Dashboard" buttons
export function frameDashboardNav(page: Page): FrameLocator {
  return frameApp(page).frameLocator('iframe[name="dbifrm_widget6"]');
}

export async function waitForFrameBody(frame: FrameLocator, timeout = 30_000): Promise<void> {
  await frame.locator('body').first().waitFor({ state: 'visible', timeout });
}
