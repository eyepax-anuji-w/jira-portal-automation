import type { FrameLocator, Page } from '@playwright/test';
import { frameApp, frameGrid, waitForFrameBody } from '../utils/frame-helper';

/**
 * All Scriptcase module pages share iframe navigation via this base class.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  content(): FrameLocator {
    return frameApp(this.page);
  }

  grid(): FrameLocator {
    return frameGrid(this.page);
  }

  async goto(path: string): Promise<void> {
    await this.page.goto(path);
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await waitForFrameBody(this.content()).catch(() => {});
  }

  async waitForNetworkSettled(): Promise<void> {
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }
}
