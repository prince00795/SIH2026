import { chromium, Browser, BrowserContext } from 'playwright';
import { ENV } from '../../config/environment.js';

export class BrowserManager {
  private static browserInstance: Browser | null = null;
  private static isAvailable = false;
  private static activeContextsCount = 0;
  private static maxConcurrentContexts = 3;

  public static async getBrowser(): Promise<Browser | null> {
    if (this.browserInstance && this.browserInstance.isConnected()) {
      return this.browserInstance;
    }

    try {
      // Standard browser launch WITHOUT anti-bot evasion flags
      this.browserInstance = await chromium.launch({
        headless: ENV.PLAYWRIGHT_HEADLESS,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          // Note: anti-bot evasion flags like --disable-blink-features=AutomationControlled removed
        ],
      });
      this.isAvailable = true;
      console.log('[Playwright] Headless Chromium browser instance initialized.');
      return this.browserInstance;
    } catch (err: any) {
      this.isAvailable = false;
      console.warn(`[Playwright Notice] Browser launch unavailable in this environment: ${err.message}`);
      return null;
    }
  }

  public static async createContext(): Promise<BrowserContext | null> {
    if (this.activeContextsCount >= this.maxConcurrentContexts) {
      console.warn(`[Playwright Rate Limit] Concurrency limit reached (${this.activeContextsCount}/${this.maxConcurrentContexts}).`);
      return null;
    }

    const browser = await this.getBrowser();
    if (!browser) return null;

    try {
      this.activeContextsCount++;
      const context = await browser.newContext({
        // Standard non-evasion transparent identifier
        userAgent: 'VayuSutra-APIx/2.0 (MoSPI Research Prototype; +https://github.com/Devparth7-coder/VayuSutra-V4)',
        viewport: { width: 1280, height: 800 },
        locale: 'en-IN',
        timezoneId: 'Asia/Kolkata',
      });
      return context;
    } catch (err: any) {
      this.activeContextsCount = Math.max(0, this.activeContextsCount - 1);
      console.warn(`[Playwright Notice] Failed to create browser context: ${err.message}`);
      return null;
    }
  }

  public static releaseContext(): void {
    this.activeContextsCount = Math.max(0, this.activeContextsCount - 1);
  }

  public static async closeBrowser(): Promise<void> {
    if (this.browserInstance) {
      await this.browserInstance.close();
      this.browserInstance = null;
      this.isAvailable = false;
      this.activeContextsCount = 0;
    }
  }

  public static checkAvailability(): boolean {
    return this.isAvailable && this.browserInstance !== null && this.browserInstance.isConnected();
  }
}
