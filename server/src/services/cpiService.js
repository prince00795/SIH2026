import fs from 'fs';
import path from 'path';
import { ENV } from '../config/environment.js';

export class CPIService {
  static cachedCPI = null;

  static getOfficialCPIData() {
    if (this.cachedCPI) return this.cachedCPI;
    
    const processedPath = path.resolve(ENV.PROCESSED_DATA_DIR, 'mospi_cpi_airfare.json');
    if (fs.existsSync(processedPath)) {
      const raw = fs.readFileSync(processedPath, 'utf8');
      this.cachedCPI = JSON.parse(raw);
      return this.cachedCPI;
    }
    return null;
  }

  static getMonthlySeries() {
    const data = this.getOfficialCPIData();
    return data && data.series ? data.series : [];
  }

  static getLatestCPI() {
    const series = this.getMonthlySeries();
    return series.length > 0 ? series[series.length - 1] : null;
  }

  static getCPIComparison(apixNationalSeries) {
    const cpiSeries = this.getMonthlySeries();
    
    // Map official monthly CPI with closest APIx values
    const comparisonPoints = cpiSeries.map(cpi => {
      // Find matching or latest APIx observation in that month
      const matchingApix = apixNationalSeries.filter(a => a.date.startsWith(cpi.date));
      const latestApix = matchingApix.length > 0 ? matchingApix[matchingApix.length - 1].indexValue : null;

      return {
        month: cpi.date,
        monthName: `${cpi.month} ${cpi.year}`,
        officialMoSPIIndex: cpi.index,
        officialYoYInflationPct: cpi.inflation_pct,
        projectDerivedAPIx: latestApix,
        spread: latestApix !== null ? parseFloat((latestApix - cpi.index).toFixed(2)) : null,
        methodologyNotes: 'MoSPI CPI (Base 2024=100) monthly retrospective vs Aerostat APIx high-frequency chained index',
      };
    });

    return {
      metadata: {
        officialItem: 'Airfare',
        officialCode: '07.3.3.1.2.01',
        officialDivision: '07 Transport',
        officialBaseYear: '2024=100',
        reportingAgency: 'Ministry of Statistics & Programme Implementation (MoSPI)',
        status: 'OFFICIAL_BENCHMARK_COMPARISON',
      },
      comparison: comparisonPoints,
    };
  }
}
