import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ModeProvider } from './context/ModeContext';
import { DashboardLayout } from './layouts/DashboardLayout';

import { CommandCenter } from './pages/CommandCenter';
import { IndexExplorer } from './pages/IndexExplorer';
import { RouteIntelligence } from './pages/RouteIntelligence';
import { RouteBasket } from './pages/RouteBasket';
import { SourceHealthPage } from './pages/SourceHealthPage';
import { RawFareExplorer } from './pages/RawFareExplorer';
import { LeadTimeAnalysis } from './pages/LeadTimeAnalysis';
import { RouteHeatmapPage } from './pages/RouteHeatmapPage';
import { MoSPIBenchmark } from './pages/MoSPIBenchmark';
import { CPIComparisonPage } from './pages/CPIComparisonPage';
import { BacktestPage } from './pages/BacktestPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { ProvenancePage } from './pages/ProvenancePage';
import { AlertsPage } from './pages/AlertsPage';
import { ApiDocsPage } from './pages/ApiDocsPage';

export const App: React.FC = () => {
  return (
    <ModeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<CommandCenter />} />
            <Route path="/index-explorer" element={<IndexExplorer />} />
            <Route path="/route-intelligence" element={<RouteIntelligence />} />
            <Route path="/route-basket" element={<RouteBasket />} />
            <Route path="/source-health" element={<SourceHealthPage />} />
            <Route path="/raw-fares" element={<RawFareExplorer />} />
            <Route path="/lead-time" element={<LeadTimeAnalysis />} />
            <Route path="/route-heatmap" element={<RouteHeatmapPage />} />
            <Route path="/mospi-cpi" element={<MoSPIBenchmark />} />
            <Route path="/cpi-comparison" element={<CPIComparisonPage />} />
            <Route path="/backtest" element={<BacktestPage />} />
            <Route path="/methodology" element={<MethodologyPage />} />
            <Route path="/provenance" element={<ProvenancePage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/api-docs" element={<ApiDocsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ModeProvider>
  );
};

export default App;
