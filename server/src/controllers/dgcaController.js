import { DGCAService } from '../services/dgcaService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class DGCAController {
  static async getAllCityPairs(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 786;
      const data = DGCAService.getAllCityPairs(limit);
      sendSuccess(
        res,
        {
          totalDomesticPassengers: data.metadata?.total_domestic_passengers_2022_23 || 136028655,
          totalCityPairsReported: data.totalReported || 786,
          displayedPairsCount: data.pairs.length,
          cityPairs: data.pairs,
        },
        {
          badge: 'OFFICIAL',
          reportingAgency: 'Directorate General of Civil Aviation (DGCA), Government of India',
          sourceDocument: 'CITY PAIR WISE SCHEDULED DOMESTIC PASSENGER TRAFFIC STATISTICS FOR THE YEAR 2022-23',
          sheetMetadataNotice: 'Document header title corresponds to official FY 2022-23 traffic report',
        }
      );
    } catch (err) {
      sendError(res, err.message || 'Failed to fetch DGCA city pairs', 'DGCA_FETCH_ERROR');
    }
  }

  static async getTopWeights(req, res) {
    try {
      const topN = parseInt(req.query.topN) || 20;
      const basket = DGCAService.getTopRoutes(topN);
      const totalBasketTraffic = basket.reduce((acc, r) => acc + r.totalTwoWayTraffic, 0);
      const totalNetworkTraffic = 136028655;

      sendSuccess(
        res,
        {
          topN,
          totalNetworkTraffic,
          basketTotalTraffic: totalBasketTraffic,
          coveragePct: parseFloat(((totalBasketTraffic / totalNetworkTraffic) * 100).toFixed(2)),
          routes: basket,
        },
        {
          badge: 'OFFICIAL_DERIVED',
          versionId: `RW-DGCA-2022-23-TOP${topN}`,
          reportingAgency: 'DGCA / Prototype Fallback Derivation',
          methodology: 'Normalized share of total two-way scheduled domestic passenger traffic',
          weightLabel: 'DGCA TRAFFIC-DERIVED WEIGHT',
          statutoryDisclaimer:
            'DGCA traffic volume shares used for prototype route ranking and weighting. Official MoSPI route-level CPI weights will be imported once published by Price Statistics Division.',
        }
      );
    } catch (err) {
      sendError(res, err.message || 'Failed to fetch DGCA weights', 'DGCA_WEIGHTS_ERROR');
    }
  }
}
