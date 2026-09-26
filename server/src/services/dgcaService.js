import fs from 'fs';
import path from 'path';
import { ENV } from '../config/environment.js';

export const CITY_IATA_MAP = {
  'MUMBAI': { iata: 'BOM', city: 'Mumbai' },
  'DELHI': { iata: 'DEL', city: 'New Delhi' },
  'BENGALURU': { iata: 'BLR', city: 'Bengaluru' },
  'KOLKATA': { iata: 'CCU', city: 'Kolkata' },
  'HYDERABAD': { iata: 'HYD', city: 'Hyderabad' },
  'CHENNAI': { iata: 'MAA', city: 'Chennai' },
  'PUNE': { iata: 'PNQ', city: 'Pune' },
  'DABOLIM': { iata: 'GOI', city: 'Goa (Dabolim)' },
  'GOA': { iata: 'GOI', city: 'Goa' },
  'AHMEDABAD': { iata: 'AMD', city: 'Ahmedabad' },
  'SRINAGAR': { iata: 'SXR', city: 'Srinagar' },
  'PATNA': { iata: 'PAT', city: 'Patna' },
  'GUWAHATI': { iata: 'GAU', city: 'Guwahati' },
  'KOCHI': { iata: 'COK', city: 'Kochi' },
  'JAIPUR': { iata: 'JAI', city: 'Jaipur' },
  'LUCKNOW': { iata: 'LKO', city: 'Lucknow' },
  'VARANASI': { iata: 'VNS', city: 'Varanasi' },
  'BHUBANESWAR': { iata: 'BBI', city: 'Bhubaneswar' },
  'RANCHI': { iata: 'IXR', city: 'Ranchi' },
  'RAIPUR': { iata: 'RPR', city: 'Raipur' },
  'INDORE': { iata: 'IDR', city: 'Indore' },
  'CHANDIGARH': { iata: 'IXC', city: 'Chandigarh' },
  'VADODARA': { iata: 'BDQ', city: 'Vadodara' },
  'COIMBATORE': { iata: 'CJB', city: 'Coimbatore' },
  'TRIVANDRUM': { iata: 'TRV', city: 'Thiruvananthapuram' },
  'VISAKHAPATNAM': { iata: 'VTZ', city: 'Visakhapatnam' },
  'NAGPUR': { iata: 'NAG', city: 'Nagpur' },
  'BAGDOGRA': { iata: 'IXB', city: 'Bagdogra' },
  'AMRITSAR': { iata: 'ATQ', city: 'Amritsar' },
  'PORT BLAIR': { iata: 'IXZ', city: 'Port Blair' },
  'DEHRADUN': { iata: 'DED', city: 'Dehradun' },
  'MANGALORE': { iata: 'IXE', city: 'Mangalore' },
  'MADURAI': { iata: 'IXM', city: 'Madurai' },
  'UDAIPUR': { iata: 'UDR', city: 'Udaipur' },
  'AGARTALA': { iata: 'IXA', city: 'Agartala' },
  'IMPHAL': { iata: 'IMF', city: 'Imphal' },
  'LEH': { iata: 'IXL', city: 'Leh' },
};

export class DGCAService {
  static cachedData = null;

  static getProcessedData() {
    if (this.cachedData) return this.cachedData;
    
    // Attempt reading from processed data file
    const processedPath = path.resolve(ENV.PROCESSED_DATA_DIR, 'dgca_city_pairs_ranked.json');
    if (fs.existsSync(processedPath)) {
      const raw = fs.readFileSync(processedPath, 'utf8');
      this.cachedData = JSON.parse(raw);
      return this.cachedData;
    }
    return null;
  }

  static getTopRoutes(topN = 20) {
    const data = this.getProcessedData();
    if (!data || !data.all_city_pairs) {
      return [];
    }

    const sliced = data.all_city_pairs.slice(0, topN);
    const basketSum = sliced.reduce((acc, item) => acc + item.total_two_way_passengers, 0);

    return sliced.map((item, idx) => {
      const c1Upper = item.city1.toUpperCase().trim();
      const c2Upper = item.city2.toUpperCase().trim();
      const orig = CITY_IATA_MAP[c1Upper] || { iata: c1Upper.substring(0, 3), city: item.city1 };
      const dest = CITY_IATA_MAP[c2Upper] || { iata: c2Upper.substring(0, 3), city: item.city2 };
      const routeCode = `${orig.iata}-${dest.iata}`;

      return {
        routeCode,
        originCity: orig.city,
        destinationCity: dest.city,
        originIATA: orig.iata,
        destinationIATA: dest.iata,
        passengersTo: item.passengers_to_city2,
        passengersFrom: item.passengers_from_city2,
        totalTwoWayTraffic: item.total_two_way_passengers,
        rank: idx + 1,
        weightInBasket: parseFloat((item.total_two_way_passengers / basketSum).toFixed(6)),
        networkSharePct: parseFloat(((item.total_two_way_passengers / data.metadata.total_domestic_passengers_2022_23) * 100).toFixed(2)),
        weightLabel: 'DGCA TRAFFIC-DERIVED WEIGHT',
      };
    });
  }

  static getAllCityPairs(limit = 100) {
    const data = this.getProcessedData();
    if (!data) return { metadata: {}, pairs: [] };
    return {
      metadata: data.metadata,
      totalReported: data.all_city_pairs.length,
      pairs: data.all_city_pairs.slice(0, limit),
    };
  }

  static getRouteMetadata(routeCode) {
    const top20 = this.getTopRoutes(30);
    const match = top20.find(r => r.routeCode === routeCode.toUpperCase());
    if (match) return match;

    const parts = routeCode.toUpperCase().split('-');
    return {
      routeCode: routeCode.toUpperCase(),
      originCity: parts[0] || 'Unknown',
      destinationCity: parts[1] || 'Unknown',
      originIATA: parts[0] || 'UNK',
      destinationIATA: parts[1] || 'UNK',
      passengersTo: 0,
      passengersFrom: 0,
      totalTwoWayTraffic: 0,
      rank: 999,
      weightInBasket: 0,
      networkSharePct: 0,
      weightLabel: 'DGCA TRAFFIC-DERIVED WEIGHT',
    };
  }
}
