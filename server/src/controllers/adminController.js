import { getDatabaseStatus } from '../config/database.js';
import { BrowserManager } from '../scrapers/core/BrowserManager.js';
import { ScrapeOrchestrator } from '../services/scrapeOrchestrator.js';
import { ENV } from '../config/environment.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class AdminController {
  static async getHealth(req, res) {
    try {
      const dbStatus = getDatabaseStatus();
      const isBrowserAvailable = BrowserManager.checkAvailability();

      sendSuccess(
        res,
        {
          server: 'OK',
          database: dbStatus.isConnected ? 'CONNECTED' : (ENV.SCRAPER_MODE === 'DEMO' ? 'DEMO_STORE' : 'DISCONNECTED'),
          playwright: isBrowserAvailable ? 'READY' : 'UNAVAILABLE',
          scraper: ENV.SCRAPER_MODE,
          mode: ENV.SCRAPER_MODE,
          environment: ENV.NODE_ENV,
          timestamp: new Date().toISOString(),
          sourcesCount: 11,
          topNRouted: 20,
        },
        {
          databaseDetails: dbStatus,
          playwrightDetails: {
            engine: 'Chromium',
            isAvailable: isBrowserAvailable,
            headless: ENV.PLAYWRIGHT_HEADLESS,
            rateLimitRps: ENV.RATE_LIMIT_RPS,
          },
        }
      );
    } catch (err) {
      sendError(res, err.message || 'Failed to get health status', 'HEALTH_ERROR');
    }
  }

  static async triggerScrapeRun(req, res) {
    try {
      const runId = await ScrapeOrchestrator.startScrapeRun(req.body);
      sendSuccess(
        res,
        {
          scrapeRunId: runId,
          status: 'STARTED',
        },
        {
          message: `Playwright scrape pipeline initiated across enabled sources and route basket (Run ID: ${runId})`,
          startedAt: new Date().toISOString(),
        }
      );
    } catch (err) {
      sendError(res, err.message || 'Failed to trigger scrape run', 'SCRAPE_TRIGGER_ERROR');
    }
  }

  static async getScrapeRunById(req, res) {
    try {
      const runId = req.params.id;
      const run = await ScrapeOrchestrator.getRunById(runId);

      if (!run) {
        sendError(res, `Scrape run with ID '${runId}' not found.`, 'RUN_NOT_FOUND', 404);
        return;
      }

      sendSuccess(res, run);
    } catch (err) {
      sendError(res, err.message || 'Failed to fetch scrape run', 'SCRAPE_RUN_FETCH_ERROR');
    }
  }

  static async listScrapeRuns(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const runs = await ScrapeOrchestrator.listRuns(limit);
      sendSuccess(res, runs, { count: runs.length });
    } catch (err) {
      sendError(res, err.message || 'Failed to list scrape runs', 'SCRAPE_RUNS_LIST_ERROR');
    }
  }

  static async triggerSingleSource(req, res) {
    try {
      const source = req.params.source;
      const runId = await ScrapeOrchestrator.startScrapeRun({
        sourceNames: [source],
        mode: 'LIVE',
      });

      sendSuccess(
        res,
        {
          scrapeRunId: runId,
          status: 'STARTED',
          source,
        },
        {
          message: `Autonomous extraction initiated for source adapter '${source}' (Run ID: ${runId})`,
          timestamp: new Date().toISOString(),
        }
      );
    } catch (err) {
      sendError(res, err.message || 'Failed to trigger source scrape', 'SOURCE_TRIGGER_ERROR');
    }
  }
}
