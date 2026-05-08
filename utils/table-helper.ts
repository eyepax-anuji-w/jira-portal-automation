import type { FrameLocator } from '@playwright/test';

/**
 * Helpers for jQuery DataTables-style grids inside #ifrGrid.
 */
export async function getDataTableRowTexts(
  gridFrame: FrameLocator,
  options?: { tableSelector?: string }
): Promise<string[]> {
  const table = gridFrame.locator(options?.tableSelector ?? 'table.dataTable, table').first();
  await table.waitFor({ state: 'visible' }).catch(() => {});
  const rows = table.locator('tbody tr');
  const count = await rows.count();
  const texts: string[] = [];
  for (let i = 0; i < count; i++) {
    texts.push((await rows.nth(i).innerText()).replace(/\s+/g, ' ').trim());
  }
  return texts;
}

export async function findRowContaining(
  gridFrame: FrameLocator,
  text: string
): Promise<boolean> {
  const row = gridFrame.locator('tbody tr').filter({ hasText: text });
  return row.first().isVisible().catch(() => false);
}
