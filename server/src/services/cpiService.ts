import fs from 'fs';
import path from 'path';
import { ENV } from '../config/environment.js';

export interface ICPIRecord {
  year: number;
  month: string;
  month_num: number;
  date: string;
  code: string;
  item: string;
  division: string;
  base_year: string;
  index: number;
  inflation_pct: number | null;
}

export class CPIService {
  private static cachedCPI: any = null;

  public static getOfficialCPIData() {
    if (this.cachedCPI) return this.cachedCPI;
    
    const processedPath = path.resolve(ENV.PROCESSED_DATA_DIR, 'mospi_cpi_airfare.json');
    if (fs.existsSync(processedPath)) {
      const raw = fs.readFileSync(processedPath, 'utf8');
      this.cachedCPI = JSON.parse(raw);
      return this.cachedCPI;
    }
    return null;
  }

  public static getMonthlySeries(): ICPIRecord[] {
    const data = this.getOfficialCPIData();
    return data && data.series ? data.series : [];
  }

  public static getLatestCPI(): ICPIRecord | null {
    const series = this.getMonthlySeries();
    return series.length > 0 ? series[series.length - 1] : null;
  }

  public static getCPIComparison(apixNationalSeries: Array<{ date: string; indexValue: number }>) {
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
        methodologyNotes: 'MoSPI CPI (Base 2024=100) monthly retrospective vs VayuSutra APIx high-frequency chained index',
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
