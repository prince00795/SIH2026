const API_BASE = '/api';

async function request(endpoint, options) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    const json = await res.json();
    if (!res.ok && json.success === undefined) {
      return {
        success: false,
        data: null,
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
  } catch (err) {
    return {
      success: false,
      data: null,
      error: { code: 'NETWORK_ERROR', message: err.message || 'Network request failed' },
    };
  }
}

export const api = {
  // System Health
  async getHealth() {
    return request('/health');
  },

  // DGCA
  async getDGCARoutes(limit = 786) {
    return request(`/dgca/routes?limit=${limit}`);
  },

  async getDGCAWeights(topN = 20) {
    return request(`/dgca/weights?topN=${topN}`);
  },

  // Routes
  async getRoutes(topN = 20) {
    return request(`/routes?topN=${topN}`);
  },

  async getRouteDossier(routeCode, mode = 'DEMO') {
    return request(`/routes/${routeCode}?mode=${mode}`);
  },

  async compareRoutes(r1, r2, mode = 'DEMO') {
    return request(`/routes/compare?route1=${r1}&route2=${r2}&mode=${mode}`);
  },

  // Index APIx
  async getNationalIndex(mode = 'DEMO', timeframe = '30D') {
    return request(`/index/national?mode=${mode}&timeframe=${timeframe}`);
  },

  async getRouteIndex(routeCode, mode = 'DEMO') {
    return request(`/index/route/${routeCode}?mode=${mode}`);
  },

  async getHeatmap(mode = 'DEMO') {
    return request(`/index/heatmap?mode=${mode}`);
  },

  async getLeadTimeCurve(routeCode = 'DEL-BOM', mode = 'DEMO') {
    return request(`/index/lead-time?route=${routeCode}&mode=${mode}`);
  },

  // Sources
  async getSources() {
    return request('/sources');
  },

  async getSourceHealth(mode = 'DEMO') {
    return request(`/sources/health?mode=${mode}`);
  },

  async triggerScrapeSource(sourceName, routeCode = 'DEL-BOM', horizon = 'T+7') {
    return request('/sources/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceName, routeCode, horizon }),
    });
  },

  async triggerScrapeRun(options = {}) {
    return request('/scrape/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });
  },

  async getScrapeRuns() {
    return request('/scrape/runs');
  },

  async getScrapeRunById(id) {
    return request(`/scrape/runs/${id}`);
  },

  // CPI
  async getOfficialCPI() {
    return request('/cpi/airfare');
  },

  async getCPIComparison(mode = 'DEMO') {
    return request(`/cpi/compare?mode=${mode}`);
  },

  // Quotes
  async getQuotes(
    page = 1,
    limit = 50,
    filters = {},
    mode = 'DEMO'
  ) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit), mode });
    if (filters.route) params.append('route', filters.route);
    if (filters.carrier) params.append('carrier', filters.carrier);
    if (filters.horizon) params.append('horizon', filters.horizon);
    return request(`/quotes?${params.toString()}`);
  },

  async getQuoteById(id, mode = 'DEMO') {
    return request(`/quotes/${id}?mode=${mode}`);
  },

  // Analytics, Anomalies & Quality
  async getAnomalies(mode = 'DEMO') {
    return request(`/anomalies?mode=${mode}`);
  },

  async getDataQuality(mode = 'DEMO') {
    return request(`/data-quality?mode=${mode}`);
  },

  async getBacktestStatus() {
    return request('/backtest');
  },

  async simulateScenario(params) {
    return request('/scenario/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
  },
};
