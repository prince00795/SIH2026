# VayuSutra APIx Architecture Specification
## Institutional Technical Blueprint & Full-Stack MERN Architecture

### 1. Architectural Principles
1. **Separation of Concerns:** Distinct decoupled layers for ingestion, normalization, indexing, storage, and presentation.
2. **Statutory Integrity:** Cryptographic hashing (SHA-256) of every quote at point of collection; zero fabrication of missing data.
3. **Resilience & Graceful Degradation:** Automatic in-memory fallback store if MongoDB Atlas / local MongoDB daemon is unreachable, enabling immediate demonstration without infrastructure friction.
4. **Ethical Web Scraping:** Centralized token-bucket rate limiting (1.5 req/s), robots.txt enforcement, transparent error states (`BLOCKED`, `UNAVAILABLE`) rather than evasive bot-like countermeasures.

---

### 2. Full-Stack Component Diagram

```
+-----------------------------------------------------------------------+
|                            USER INTERFACE                             |
|       React 18 + Vite + TypeScript (Single Page Application)          |
|  - National Command Center        - APIx Index Explorer               |
|  - Route Intelligence & Dossiers  - Route Basket & Weights            |
|  - 11-Source Status Monitor       - Raw Fare Cryptographic Ledger     |
|  - Lead-Time Dynamics             - 20x5 Route Heatmap Matrix         |
|  - Official MoSPI Benchmark       - High-Frequency CPI Comparison     |
|  - Backtest Pending Framework     - Comprehensive Methodology Guide   |
|  - Data Provenance Verifier       - Alerts & Anomalies System         |
|  - Interactive REST API Docs      - Mode Switcher (LIVE / DEMO)       |
+-----------------------------------------------------------------------+
                                  |
                                  | HTTP / JSON REST APIs
                                  v
+-----------------------------------------------------------------------+
|                            EXPRESS SERVER                             |
|                 Node.js v20+ / TypeScript (Port 8000)                 |
|  Controllers:                                                         |
|  - dgcaController.ts    - indexController.ts    - routeController.ts  |
|  - cpiController.ts     - sourceController.ts   - quoteController.ts  |
|  - analyticsController  - adminController.ts                          |
+-----------------------------------------------------------------------+
         |                                             |
         v                                             v
+-----------------------+                    +--------------------------+
|  INDEX ENGINE (APIx)  |                    |   AUTOMATION & SCRAPING  |
| - Short-Jevons Rels   |                    | Playwright Browser Engine|
| - 5-Horizon Synthesis |                    | - 5 Direct Airlines      |
| - DGCA Traffic Weights|                    | - 6 Online Travel Aggrs  |
| - Cumulative Chaining |                    | - RateLimiter (1.5 rps)  |
| - Outlier (MAD / IQR) |                    | - RobotsChecker          |
+-----------------------+                    | - Normalizer & Cleaner   |
                                             +--------------------------+
         |                                             |
         v                                             v
+-----------------------------------------------------------------------+
|                          PERSISTENCE LAYER                            |
|  - MongoDB / Mongoose (Quotes, IndexSeries, SourceHealth, Benchmarks) |
|  - Standalone File/Memory Store (Demo Mode & Out-of-the-Box Fallback) |
|  - Official Ingestion Assets:                                         |
|    * data/processed/dgca_city_pairs_ranked.json (786 city-pairs)     |
|    * data/processed/mospi_cpi_airfare.json (20 official months)       |
+-----------------------------------------------------------------------+
```

---

### 3. Data Schema & Models

1. **Route (`Route.ts`)**: City-pair definitions, IATA codes, passenger counts from DGCA (passengersTo, passengersFrom, totalTwoWayTraffic), rank, network share.
2. **RouteWeight (`RouteWeight.ts`)**: Versioned basket weights calculated as $w_r = \text{Pax}_r / \sum \text{Pax}$. Labeled `DGCA TRAFFIC-DERIVED WEIGHT`.
3. **Quote (`Quote.ts`)**: Raw observed quote, containing source, routeCode, advanceWindow ($T+1, T+7, T+15, T+30, T+45$), carrier, baseFare, taxes, totalFare, collectionTimestamp, sha256Signature.
4. **CleanedQuote (`CleanedQuote.ts`)**: Normalized flight number, deduplication flag, outlier flag (MAD modified z-score $> 3.0$).
5. **IndexObservation (`IndexObservation.ts`)**: Elementary cell price relatives, sample quote counts, dispersion.
6. **IndexSeries (`IndexSeries.ts`)**: Chained daily National and Corridor indices with timestamp.
7. **SourceHealth (`SourceHealth.ts`)**: Operational state, latency, 24h success/failure counters, ethical limits.
8. **CPIBenchmark (`CPIBenchmark.ts`)**: Official MoSPI monthly indices and YoY rates.
9. **Alert (`Alert.ts`)**: Horizon Inversions, Directional Asymmetries, Volatility Spikes.
