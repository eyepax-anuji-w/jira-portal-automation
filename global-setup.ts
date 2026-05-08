import { chromium, type FullConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { LoginPage } from './pages/LoginPage';

dotenv.config();

export default async function globalSetup(_config: FullConfig): Promise<void> {
  const baseURL = process.env.BASE_URL ?? 'https://jira2-stage.eyepax.info';
  const authDir = path.join(process.cwd(), 'auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const roles: Array<{ file: string; id?: string; pass?: string }> = [
    { file: 'user.json', id: process.env.E2E_USER_ID, pass: process.env.E2E_PASSWORD },
    {
      file: 'supervisor.json',
      id: process.env.E2E_SUPERVISOR_ID,
      pass: process.env.E2E_SUPERVISOR_PASSWORD,
    },
    { file: 'admin.json', id: process.env.E2E_ADMIN_ID, pass: process.env.E2E_ADMIN_PASSWORD },
  ];

  const browser = await chromium.launch({ headless: true });

  for (const r of roles) {
    if (!r.id || !r.pass) {
      // eslint-disable-next-line no-console
      console.warn(`[global-setup] Skipping auth/${r.file} — credentials not set`);
      continue;
    }

    const context = await browser.newContext({ baseURL });
    const page = await context.newPage();
    const login = new LoginPage(page);

    try {
      await login.gotoLogin();
      await login.login(r.id, r.pass);
      await login.dismissMoodPopupIfPresent();
      const out = path.join(authDir, r.file);
      await context.storageState({ path: out });
      // eslint-disable-next-line no-console
      console.log(`[global-setup] Saved ${out}`);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`[global-setup] Failed for ${r.file}:`, e);
    } finally {
      await context.close();
    }
  }

  await browser.close();
}
