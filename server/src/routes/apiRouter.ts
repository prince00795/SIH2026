import { Router } from 'express';
import { DGCAController } from '../controllers/dgcaController.js';
import { CPIController } from '../controllers/cpiController.js';
import { IndexController } from '../controllers/indexController.js';
import { RouteController } from '../controllers/routeController.js';
import { QuoteController } from '../controllers/quoteController.js';
import { SourceController } from '../controllers/sourceController.js';
import { AnalyticsController } from '../controllers/analyticsController.js';
import { AdminController } from '../controllers/adminController.js';

export const apiRouter = Router();

// Health & System
apiRouter.get('/health', AdminController.getHealth);

// DGCA Datasets & Weights
apiRouter.get('/dgca/routes', DGCAController.getAllCityPairs);
apiRouter.get('/dgca/weights', DGCAController.getTopWeights);

// Routes
apiRouter.get('/routes', RouteController.getRoutes);
apiRouter.get('/routes/compare', RouteController.compareRoutes);
apiRouter.get('/routes/:route', RouteController.getRouteDossier);

// Quotes & Provenance
apiRouter.get('/quotes', QuoteController.getQuotes);
apiRouter.get('/quotes/:id', QuoteController.getQuoteById);

// Index APIx
apiRouter.get('/index/national', IndexController.getNationalIndex);
apiRouter.get('/index/route/:route', IndexController.getRouteIndex);
apiRouter.get('/index/heatmap', IndexController.getHeatmapMatrix);
apiRouter.get('/index/lead-time', IndexController.getLeadTimeCurve);

// Sources & Telemetry
apiRouter.get('/sources', SourceController.getSourcesCatalog);
apiRouter.get('/sources/health', SourceController.getSourceHealth);
apiRouter.post('/sources/trigger', SourceController.triggerSourceScrape);

// Official MoSPI CPI
apiRouter.get('/cpi/airfare', CPIController.getOfficialAirfareCPI);
apiRouter.get('/cpi/compare', CPIController.getCPIComparison);

// Analytics, Anomalies & Backtest
apiRouter.get('/anomalies', AnalyticsController.getAnomalies);
apiRouter.get('/data-quality', AnalyticsController.getDataQuality);
apiRouter.get('/backtest', AnalyticsController.getBacktestStatus);
apiRouter.post('/scenario/simulate', AnalyticsController.simulateScenario);

// Scraping Triggers & Execution Orchestration
apiRouter.post('/scrape/run', AdminController.triggerScrapeRun);
apiRouter.get('/scrape/runs', AdminController.listScrapeRuns);
apiRouter.get('/scrape/runs/:id', AdminController.getScrapeRunById);
apiRouter.post('/scrape/source/:source', AdminController.triggerSingleSource);

