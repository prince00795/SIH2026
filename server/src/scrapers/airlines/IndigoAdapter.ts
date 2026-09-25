import { ScraperBase, ISearchParams, IRawQuoteExtracted } from '../core/ScraperBase.js';
import { BrowserManager } from '../core/BrowserManager.js';
import { RobotsChecker } from '../core/RobotsChecker.js';

export class IndigoAdapter extends ScraperBase {
  public sourceName = 'IndiGo';
  public sourceType = 'AIRLINE' as const;
  public portalUrl = 'https://www.goindigo.in';

  public async searchFlights(params: ISearchParams): Promise<IRawQuoteExtracted[]> {
    await this.rateLimiter.acquire();

    const allowed = await RobotsChecker.isAllowed(this.portalUrl);
    if (!allowed) {
      console.warn(`[Robots.txt] Scraping prohibited on ${this.portalUrl}`);
      return [];
    }

    const context = await BrowserManager.createContext();
    if (!context) {
      return [];
    }

    try {
      const page = await context.newPage();
      page.setDefaultTimeout(15000);

      // Attempt navigating to search URL
      const searchUrl = `${this.portalUrl}/flight-search.html?from=${params.origin}&to=${params.destination}&date=${params.departureDate}`;
      const response = await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

      if (!response || response.status() >= 400) {
        console.warn(`[IndiGo] HTTP ${response?.status()} received.`);
        await page.close();
        await context.close();
        return [];
      }

      // Check for bot challenge or captcha
      const isBlocked = await page.evaluate(() => {
        return document.body.innerText.includes('Access Denied') ||
               document.body.innerText.includes('Cloudflare') ||
               document.body.innerText.includes('Robot or human');
      });

      if (isBlocked) {
        console.warn('[IndiGo] Automation challenge encountered. Aborting ethically.');
        await page.close();
        await context.close();
        return [];
      }

      await page.close();
      await context.close();
      return [];
    } catch (err: any) {
      console.warn(`[IndiGo Adapter Notice] ${err.message}`);
      await context.close();
      return [];
    }
  }
}
