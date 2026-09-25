import { ScraperBase, ISearchParams, IRawQuoteExtracted } from '../core/ScraperBase.js';
import { BrowserManager } from '../core/BrowserManager.js';
import { RobotsChecker } from '../core/RobotsChecker.js';

export class CleartripAdapter extends ScraperBase {
  public sourceName = 'Cleartrip';
  public sourceType = 'OTA' as const;
  public portalUrl = 'https://www.cleartrip.com';

  public async searchFlights(params: ISearchParams): Promise<IRawQuoteExtracted[]> {
    await this.rateLimiter.acquire();
    const allowed = await RobotsChecker.isAllowed(this.portalUrl);
    if (!allowed) return [];

    const context = await BrowserManager.createContext();
    if (!context) return [];

    try {
      const page = await context.newPage();
      page.setDefaultTimeout(15000);
      await page.goto(`${this.portalUrl}/flights`, { waitUntil: 'domcontentloaded' }).catch(() => null);
      await page.close();
      await context.close();
      return [];
    } catch {
      await context.close();
      return [];
    }
  }
}
