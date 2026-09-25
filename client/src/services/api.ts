const API_BASE = '/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  meta?: Record<string, any>;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

async function request<T = any>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    const json = await res.json();
    if (!res.ok && json.success === undefined) {
      return {
        success: false,
        data: null as any,
        error: { code: String(res.status), message: json.message || res.statusText },
      };
    }
    if (json.success !== undefined) {
      return json;
    }
    return {
      success: true,
      data: json.data !== undefined ? json.data : json,
      meta: json.meta,
    };
  } catch (err: any) {
    return {
      success: false,
      data: null as any,
      error: { code: 'NETWORK_ERROR', message: err.message || 'Network request failed' },
    };
  }
}

export const api = {
  // System Health
  async getHealth(): Promise<ApiResponse> {
    return request('/health');
  },

  // DGCA
  async getDGCARoutes(limit = 786): Promise<ApiResponse> {
    return request(`/dgca/routes?limit=${limit}`);
  },

  async getDGCAWeights(topN = 20): Promise<ApiResponse> {
    return request(`/dgca/weights?topN=${topN}`);
  },

  // Routes
  async getRoutes(topN = 20): Promise<ApiResponse> {
    return request(`/routes?topN=${topN}`);
  },

  async getRouteDossier(routeCode: string, mode: 'LIVE' | 'DEMO' = 'DEMO'): Promise<ApiResponse> {
    return request(`/routes/${routeCode}?mode=${mode}`);
  },

  async compareRoutes(r1: string, r2: string, mode: 'LIVE' | 'DEMO' = 'DEMO'): Promise<ApiResponse> {
    return request(`/routes/compare?route1=${r1}&route2=${r2}&mode=${mode}`);
  },

  // Index APIx
  async getNationalIndex(mode: 'LIVE' | 'DEMO' = 'DEMO', timeframe = '30D'): Promise<ApiResponse> {
    return request(`/index/national?mode=${mode}&timeframe=${timeframe}`);
  },

  async getRouteIndex(routeCode: string, mode: 'LIVE' | 'DEMO' = 'DEMO'): Promise<ApiResponse> {
    return request(`/index/route/${routeCode}?mode=${mode}`);
  },

  async getHeatmap(mode: 'LIVE' | 'DEMO' = 'DEMO'): Promise<ApiResponse> {
    return request(`/index/heatmap?mode=${mode}`);
  },

  async getLeadTimeCurve(routeCode = 'DEL-BOM', mode: 'LIVE' | 'DEMO' = 'DEMO'): Promise<ApiResponse> {
    return request(`/index/lead-time?route=${routeCode}&mode=${mode}`);
  },

  // Sources
  async getSources(): Promise<ApiResponse> {
    return request('/sources');
  },

  async getSourceHealth(mode: 'LIVE' | 'DEMO' = 'DEMO'): Promise<ApiResponse> {
    return request(`/sources/health?mode=${mode}`);
  },

  async triggerScrapeSource(sourceName: string, routeCode = 'DEL-BOM', horizon = 'T+7'): Promise<ApiResponse> {
    return request('/sources/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceName, routeCode, horizon }),
    });
  },

  async triggerScrapeRun(options: any = {}): Promise<ApiResponse> {
    return request('/scrape/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });
  },

  async getScrapeRuns(): Promise<ApiResponse> {
    return request('/scrape/runs');
  },

  async getScrapeRunById(id: string): Promise<ApiResponse> {
    return request(`/scrape/runs/${id}`);
  },

  // CPI
  async getOfficialCPI(): Promise<ApiResponse> {
    return request('/cpi/airfare');
  },

  async getCPIComparison(mode: 'LIVE' | 'DEMO' = 'DEMO'): Promise<ApiResponse> {
    return request(`/cpi/compare?mode=${mode}`);
  },

  // Quotes
  async getQuotes(
    page = 1,
    limit = 50,
    filters: { route?: string; carrier?: string; horizon?: string } = {},
    mode: 'LIVE' | 'DEMO' = 'DEMO'
  ): Promise<ApiResponse> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit), mode });
    if (filters.route) params.append('route', filters.route);
    if (filters.carrier) params.append('carrier', filters.carrier);
    if (filters.horizon) params.append('horizon', filters.horizon);
    return request(`/quotes?${params.toString()}`);
  },

  async getQuoteById(id: string, mode: 'LIVE' | 'DEMO' = 'DEMO'): Promise<ApiResponse> {
    return request(`/quotes/${id}?mode=${mode}`);
  },

  // Analytics, Anomalies & Quality
  async getAnomalies(mode: 'LIVE' | 'DEMO' = 'DEMO'): Promise<ApiResponse> {
    return request(`/anomalies?mode=${mode}`);
  },

  async getDataQuality(mode: 'LIVE' | 'DEMO' = 'DEMO'): Promise<ApiResponse> {
    return request(`/data-quality?mode=${mode}`);
  },

  async getBacktestStatus(): Promise<ApiResponse> {
    return request('/backtest');
  },

  async simulateScenario(params: {
    airfareShockPct: number;
    fuelShockPct: number;
    demandChangePct: number;
    capacityChangePct: number;
    fuelCostShare?: number;
    fuelPassThroughRate?: number;
    capacityTightnessElasticity?: number;
    baselineIndex?: number;
  }): Promise<ApiResponse> {
    return request('/scenario/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
  },
};

