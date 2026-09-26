import { CPIService } from '../services/cpiService.js';
import { DemoDataService } from '../services/demoDataService.js';
import { IndexEngine } from '../services/indexEngine.js';
import { QuoteModel } from '../models/Quote.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class CPIController {
  static async getOfficialAirfareCPI(req, res) {
    try {
      const series = CPIService.getMonthlySeries();
      const latest = CPIService.getLatestCPI();

      sendSuccess(
        res,
        {
          latestObservation: latest,
          seriesCount: series.length,
          series,
          monthlySeries: series,
        },
        {
          badge: 'OFFICIAL',
          sourceAgency: 'Ministry of Statistics & Programme Implementation (MoSPI)',
          division: '07 Transport',
          group: '07.3 Passenger transport services',
          class: '07.3.3 Passenger transport by air',
          subClass: '07.3.3.1 Passenger transport by air, domestic',
          item: 'Airfare',
          itemCode: '07.3.3.1.2.01',
          baseYear: '2024=100',
          sector: 'All India Combined',
          reportingFrequency: 'Monthly',
        }
      );
    } catch (err) {
      sendError(res, err.message || 'Failed to fetch official MoSPI CPI', 'CPI_FETCH_ERROR');
    }
  }

  static async getCPIComparison(req, res) {
    try {
      const mode = req.query.mode === 'LIVE' ? 'LIVE' : 'DEMO';

      if (mode === 'LIVE') {
        let liveQuotes = [];
        try {
          liveQuotes = await QuoteModel.find({ status: 'VALID' }).lean();
        } catch {
          liveQuotes = [];
        }

        // In live mode with no accumulated monthly time series
        if (!liveQuotes || liveQuotes.length < 5) {
          const result = CPIService.getCPIComparison([]);
          sendSuccess(
            res,
            result.comparison,
            {
              badge: 'UNAVAILABLE',
              mode: 'LIVE',
              status: 'UNAVAILABLE',
              notice: 'Comparison unavailable until APIx historical observations accumulate.',
              metadata: result.metadata,
            }
          );
          return;
        }

        // If live quotes exist, aggregate monthly
        const dateMap = new Map();
        for (const q of liveQuotes) {
          const dt = (q.collectionTimestamp || q.collectedAt || new Date()).toISOString().split('T')[0];
          if (!dateMap.has(dt)) dateMap.set(dt, []);
          dateMap.get(dt).push(q.totalFare);
        }

        let running = 100.0;
        let prevFare = 0;
        const apixSeries = [];

        const sortedDates = Array.from(dateMap.keys()).sort();
        for (let i = 0; i < sortedDates.length; i++) {
          const dt = sortedDates[i];
          const fares = dateMap.get(dt);
          const mean = IndexEngine.calculateJevons(fares);
          if (i > 0 && prevFare > 0) {
            running = parseFloat((running * (mean / prevFare)).toFixed(2));
          }
          prevFare = mean;
          apixSeries.push({ date: dt, indexValue: running });
        }

        const result = CPIService.getCPIComparison(apixSeries);
        sendSuccess(
          res,
          result.comparison,
          {
            badge: 'LIVE_COLLECTED',
            mode: 'LIVE',
            metadata: result.metadata,
          }
        );
        return;
      }

      // Demo Mode: Calculate from calibrated demo quotes using genuine Jevons without sine wave
      const quotes = DemoDataService.generate30DayDemoQuotes();
      const byDate = new Map();
      for (const q of quotes) {
        const dt = q.collectionTimestamp.split('T')[0];
        if (!byDate.has(dt)) byDate.set(dt, []);
        byDate.get(dt).push(q.totalFare);
      }

      const sortedDates = Array.from(byDate.keys()).sort();
      let runningIndex = 100.0;
      let prevComposite = 0;
      const apixSeries = [];

      for (let i = 0; i < sortedDates.length; i++) {
        const dt = sortedDates[i];
        const fares = byDate.get(dt);
        const mean = IndexEngine.calculateJevons(fares);
        if (i > 0 && prevComposite > 0) {
          runningIndex = parseFloat((runningIndex * (mean / prevComposite)).toFixed(2));
        }
        prevComposite = mean;
        apixSeries.push({ date: dt, indexValue: runningIndex });
      }

      const result = CPIService.getCPIComparison(apixSeries);

      sendSuccess(
        res,
        result.comparison,
        {
          badge: 'DEMO',
          mode: 'DEMO',
          metadata: result.metadata,
        }
      );
    } catch (err) {
      sendError(res, err.message || 'Failed to compare CPI and APIx', 'CPI_COMPARE_ERROR');
    }
  }
}
