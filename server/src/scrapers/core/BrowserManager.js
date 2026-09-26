import { chromium } from 'playwright';
import { ENV } from '../../config/environment.js';

export class BrowserManager {
  static browserInstance = null;
  static isAvailable = false;
  static activeContextsCount = 0;
  static maxConcurrentContexts = 3;

  static async getBrowser() {
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
    } catch (err) {
      this.isAvailable = false;
      console.warn(`[Playwright Notice] Browser launch unavailable in this environment: ${err.message}`);
      return null;
    }
  }

  static async createContext() {
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
        userAgent: 'Aerostat-APIx/2.0 (MoSPI Research Prototype; +https://github.com/Devparth7-coder/Aerostat-V4)',
        viewport: { width: 1280, height: 800 },
        locale: 'en-IN',
        timezoneId: 'Asia/Kolkata',
      });
      return context;
    } catch (err) {
      this.activeContextsCount = Math.max(0, this.activeContextsCount - 1);
      console.warn(`[Playwright Notice] Failed to create browser context: ${err.message}`);
      return null;
    }
  }

  static releaseContext() {
    this.activeContextsCount = Math.max(0, this.activeContextsCount - 1);
  }

  static async closeBrowser() {
    if (this.browserInstance) {
      await this.browserInstance.close();
      this.browserInstance = null;
      this.isAvailable = false;
      this.activeContextsCount = 0;
    }
  }

  static checkAvailability() {
    return this.isAvailable && this.browserInstance !== null && this.browserInstance.isConnected();
  }
}
