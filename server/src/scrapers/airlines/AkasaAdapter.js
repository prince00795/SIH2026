import { ScraperBase } from '../core/ScraperBase.js';
import { BrowserManager } from '../core/BrowserManager.js';
import { RobotsChecker } from '../core/RobotsChecker.js';

export class AkasaAdapter extends ScraperBase {
  sourceName = 'Akasa Air';
  sourceType = 'AIRLINE';
  portalUrl = 'https://www.akasaair.com';

  async searchFlights(params) {
    await this.rateLimiter.acquire();
    const allowed = await RobotsChecker.isAllowed(this.portalUrl);
    if (!allowed) return [];

    const context = await BrowserManager.createContext();
    if (!context) return [];

    try {
      const page = await context.newPage();
      page.setDefaultTimeout(15000);
      await page.goto(`${this.portalUrl}/`, { waitUntil: 'domcontentloaded' }).catch(() => null);
      await page.close();
      await context.close();
      return [];
    } catch {
      await context.close();
      return [];
    }
  }
}
