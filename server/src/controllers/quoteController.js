import { DemoDataService } from '../services/demoDataService.js';
import { ProvenanceService } from '../services/provenanceService.js';
import { QuoteModel } from '../models/Quote.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class QuoteController {
  static async getQuotes(req, res) {
    try {
      const mode = req.query.mode === 'LIVE' ? 'LIVE' : 'DEMO';
      const route = req.query.route;
      const carrier = req.query.carrier;
      const horizon = req.query.horizon;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;

      if (mode === 'LIVE') {
        const query = {};
        if (route) query.routeCode = route.toUpperCase();
        if (carrier) {
          query.$or = [
            { carrierCode: carrier.toUpperCase() },
            { carrierName: new RegExp(carrier, 'i') },
          ];
        }
        if (horizon) query.advanceWindow = horizon.toUpperCase();

        let quotes = [];
        let total = 0;
        try {
          total = await QuoteModel.countDocuments(query);
          quotes = await QuoteModel.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();
        } catch {
          quotes = [];
          total = 0;
        }

        sendSuccess(
          res,
          quotes,
          {
            badge: 'LIVE_COLLECTED',
            mode: 'LIVE',
            totalCount: total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
            notice: total === 0 ? 'No live quotes collected yet. Run scrapers to populate ledger.' : undefined,
          }
        );
        return;
      }

      // Demo Mode: Calibrated quotes
      let quotes = DemoDataService.generate30DayDemoQuotes();

      if (route) quotes = quotes.filter((q) => q.routeCode === route.toUpperCase());
      if (carrier) {
        quotes = quotes.filter(
          (q) =>
            q.carrierCode === carrier.toUpperCase() ||
            q.carrierName.toLowerCase().includes(carrier.toLowerCase())
        );
      }
      if (horizon) quotes = quotes.filter((q) => q.advanceWindow === horizon.toUpperCase());

      const total = quotes.length;
      const startIdx = (page - 1) * limit;
      const paginated = quotes.slice(startIdx, startIdx + limit);

      sendSuccess(
        res,
        paginated,
        {
          badge: 'DEMO',
          mode: 'DEMO',
          totalCount: total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        }
      );
    } catch (err) {
      sendError(res, err.message || 'Failed to fetch quotes', 'QUOTES_FETCH_ERROR');
    }
  }

  static async getQuoteById(req, res) {
    try {
      const quoteId = req.params.id;
      const mode = req.query.mode === 'LIVE' ? 'LIVE' : 'DEMO';

      let match = null;
      if (mode === 'LIVE') {
        try {
          match = await QuoteModel.findOne({ quoteId }).lean();
        } catch {
          match = null;
        }
      }

      if (!match) {
        const allQuotes = DemoDataService.generate30DayDemoQuotes();
        match = allQuotes.find((q) => q.quoteId === quoteId);
      }

      if (!match) {
        sendError(res, `Quote with ID '${quoteId}' not found.`, 'QUOTE_NOT_FOUND', 404);
        return;
      }

      const certificate = ProvenanceService.buildProvenanceCertificate(match);

      sendSuccess(
        res,
        {
          quote: match,
          provenanceCertificate: certificate,
        },
        {
          badge: mode === 'LIVE' ? 'LIVE_COLLECTED' : 'DEMO',
          mode,
        }
      );
    } catch (err) {
      sendError(res, err.message || 'Failed to fetch quote details', 'QUOTE_DETAILS_ERROR');
    }
  }
}
