import { ScraperBase, ISearchParams, IRawQuoteExtracted } from '../core/ScraperBase.js';
import { BrowserManager } from '../core/BrowserManager.js';
import { RobotsChecker } from '../core/RobotsChecker.js';

export class AirIndiaAdapter extends ScraperBase {
  public sourceName = 'Air India';
  public sourceType = 'AIRLINE' as const;
  public portalUrl = 'https://www.airindia.com';

  public async searchFlights(params: ISearchParams): Promise<IRawQuoteExtracted[]> {
    await this.rateLimiter.acquire();

    const allowed = await RobotsChecker.isAllowed(this.portalUrl);
    if (!allowed) {
      console.warn(`[Robots.txt] Prohibited on ${this.portalUrl}`);
      return [];
    }

    const context = await BrowserManager.createContext();
    if (!context) return [];

    try {
      const page = await context.newPage();
      page.setDefaultTimeout(15000);

      const searchUrl = `${this.portalUrl}/in/en/book/flight-search.html?origin=${params.origin}&dest=${params.destination}&date=${params.departureDate}`;
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded' }).catch(() => null);

      await page.close();
      await context.close();
      return [];
    } catch (err: any) {
      console.warn(`[Air India Adapter Notice] ${err.message}`);
      await context.close();
      return [];
    }
  }
}
