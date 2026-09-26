import { BrowserManager } from '../scrapers/core/BrowserManager.js';
import { ScrapeOrchestrator } from '../services/scrapeOrchestrator.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const REQUIRED_SOURCES = [
  // 5 Airlines
  { name: 'IndiGo', type: 'AIRLINE', carrierCode: '6E', portalUrl: 'https://www.goindigo.in', model: 'LCC', marketShareDomestic: '61.8%' },
  { name: 'Air India', type: 'AIRLINE', carrierCode: 'AI', portalUrl: 'https://www.airindia.com', model: 'FSC', marketShareDomestic: '14.5%' },
  { name: 'Air India Express', type: 'AIRLINE', carrierCode: 'IX', portalUrl: 'https://www.airindiaexpress.com', model: 'LCC', marketShareDomestic: '7.2%' },
  { name: 'Akasa Air', type: 'AIRLINE', carrierCode: 'QP', portalUrl: 'https://www.akasaair.com', model: 'LCC', marketShareDomestic: '4.7%' },
  { name: 'SpiceJet', type: 'AIRLINE', carrierCode: 'SG', portalUrl: 'https://www.spicejet.com', model: 'LCC', marketShareDomestic: '4.2%' },
  // 6 OTAs
  { name: 'MakeMyTrip', type: 'OTA', carrierCode: 'MMT', portalUrl: 'https://www.makemytrip.com', model: 'OTA Aggregator', marketShareDomestic: 'OTA Tier 1' },
  { name: 'Yatra', type: 'OTA', carrierCode: 'YTR', portalUrl: 'https://www.yatra.com', model: 'OTA Corporate & Retail', marketShareDomestic: 'OTA Tier 2' },
  { name: 'EaseMyTrip', type: 'OTA', carrierCode: 'EMT', portalUrl: 'https://www.easemytrip.com', model: 'Zero-Fee OTA Model', marketShareDomestic: 'OTA Tier 2' },
  { name: 'Cleartrip', type: 'OTA', carrierCode: 'CLR', portalUrl: 'https://www.cleartrip.com', model: 'OTA Aggregator (Flipkart Group)', marketShareDomestic: 'OTA Tier 2' },
  { name: 'Ixigo', type: 'OTA', carrierCode: 'IXI', portalUrl: 'https://www.ixigo.com', model: 'OTA Aggregator', marketShareDomestic: 'OTA Tier 2' },
  { name: 'Goibibo', type: 'OTA', carrierCode: 'GIB', portalUrl: 'https://www.goibibo.com', model: 'OTA Aggregator', marketShareDomestic: 'OTA Tier 2' },
];

export class SourceController {
  static async getSourcesCatalog(req, res) {
    try {
      const isBrowserAvailable = BrowserManager.checkAvailability();
      sendSuccess(
        res,
        REQUIRED_SOURCES,
        {
          totalRequiredSources: REQUIRED_SOURCES.length,
          airlinesCount: 5,
          otasCount: 6,
          playwrightEngineAvailable: isBrowserAvailable,
        }
      );
    } catch (err) {
      sendError(res, err.message || 'Failed to fetch sources catalog', 'SOURCES_CATALOG_ERROR');
    }
  }

  static async getSourceHealth(req, res) {
    try {
      const mode = req.query.mode === 'LIVE' ? 'LIVE' : 'DEMO';

      if (mode === 'LIVE') {
        const healthList = await ScrapeOrchestrator.getSourceHealthSummary();
        const activeCount = healthList.filter((h) => h.currentStatus === 'LIVE' || h.currentStatus === 'SUCCESS').length;

        sendSuccess(
          res,
          healthList,
          {
            badge: 'LIVE_COLLECTED',
            mode: 'LIVE',
            activeSourcesCount: activeCount,
            totalSourcesMonitored: healthList.length,
          }
        );
        return;
      }

      // Demo Mode: Clearly badged DEMO
      const healthList = REQUIRED_SOURCES.map((s, idx) => ({
        sourceName: s.name,
        sourceType: s.type,
        portalUrl: s.portalUrl,
        currentStatus: 'DEMO',
        lastAttemptAt: new Date(Date.now() - (idx + 1) * 3600000).toISOString(),
        lastSuccessAt: new Date(Date.now() - (idx + 1) * 3600000).toISOString(),
        successCount24h: 120,
        failureCount24h: 0,
        avgLatencyMs: 140 + idx * 25,
        quotesCollected24h: 240,
        lastError: null,
        ethicalControls: {
          rateLimiting: '1.5 req/s token-bucket enforced',
          robotsTxtCompliant: true,
          stealthEvasionUsed: false,
        },
      }));

      sendSuccess(
        res,
        healthList,
        {
          badge: 'DEMO',
          mode: 'DEMO',
          activeSourcesCount: healthList.length,
          totalSourcesMonitored: healthList.length,
        }
      );
    } catch (err) {
      sendError(res, err.message || 'Failed to fetch source health', 'SOURCE_HEALTH_ERROR');
    }
  }

  static async triggerSourceScrape(req, res) {
    try {
      const sourceName = req.body?.sourceName || req.params?.source;
      const routeCode = req.body?.routeCode || 'DEL-BOM';
      const horizon = req.body?.horizon || 'T+7';

      const runId = await ScrapeOrchestrator.startScrapeRun({
        sourceNames: sourceName ? [sourceName] : undefined,
        routeCodes: [routeCode],
        horizons: [horizon],
        mode: 'LIVE',
      });

      sendSuccess(
        res,
        {
          scrapeRunId: runId,
          status: 'STARTED',
          sourceName,
          routeCode,
          horizon,
        },
        {
          message: `Scraper run started for ${sourceName || 'selected sources'} (Run ID: ${runId})`,
        }
      );
    } catch (err) {
      sendError(res, err.message || 'Failed to trigger scraper run', 'SCRAPE_TRIGGER_ERROR');
    }
  }
}
