import { Request, Response } from 'express';
import { CPIService } from '../services/cpiService.js';
import { DemoDataService } from '../services/demoDataService.js';
import { IndexEngine } from '../services/indexEngine.js';
import { QuoteModel } from '../models/Quote.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class CPIController {
  public static async getOfficialAirfareCPI(req: Request, res: Response): Promise<void> {
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
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch official MoSPI CPI', 'CPI_FETCH_ERROR');
    }
  }

  public static async getCPIComparison(req: Request, res: Response): Promise<void> {
    try {
      const mode = (req.query.mode as string) === 'LIVE' ? 'LIVE' : 'DEMO';

      if (mode === 'LIVE') {
        let liveQuotes: any[] = [];
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
        const dateMap = new Map<string, number[]>();
        for (const q of liveQuotes) {
          const dt = (q.collectionTimestamp || q.collectedAt || new Date()).toISOString().split('T')[0];
          if (!dateMap.has(dt)) dateMap.set(dt, []);
          dateMap.get(dt)!.push(q.totalFare);
        }

        let running = 100.0;
        let prevFare = 0;
        const apixSeries: Array<{ date: string; indexValue: number }> = [];

        const sortedDates = Array.from(dateMap.keys()).sort();
        for (let i = 0; i < sortedDates.length; i++) {
          const dt = sortedDates[i];
          const fares = dateMap.get(dt)!;
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
      const byDate = new Map<string, number[]>();
      for (const q of quotes) {
        const dt = q.collectionTimestamp.split('T')[0];
        if (!byDate.has(dt)) byDate.set(dt, []);
        byDate.get(dt)!.push(q.totalFare);
      }

      const sortedDates = Array.from(byDate.keys()).sort();
      let runningIndex = 100.0;
      let prevComposite = 0;
      const apixSeries: Array<{ date: string; indexValue: number }> = [];

      for (let i = 0; i < sortedDates.length; i++) {
        const dt = sortedDates[i];
        const fares = byDate.get(dt)!;
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
    } catch (err: any) {
      sendError(res, err.message || 'Failed to compare CPI and APIx', 'CPI_COMPARE_ERROR');
    }
  }
}

