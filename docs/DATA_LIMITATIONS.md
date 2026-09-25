# Data Limitations & Statutory Integrity Notice
## Transparent Classification of Datasets, Weights & Empirical Status

### 1. Data Classification Matrix

To ensure absolute credibility for MoSPI, RBI, and hackathon evaluators, all data points in VayuSutra APIx are categorized into one of six explicit classes:

| Status Badge | Classification | Description & Source |
|---|---|---|
| `[OFFICIAL]` | Statutory Authority Data | Verbatim statutory statistics directly from DGCA or MoSPI releases. (e.g. DGCA 786 city-pair passenger totals, MoSPI CPI Item 07.3.3.1.2.01). |
| `[OFFICIAL_DERIVED]` | Mathematical Derivations from Official Sources | Ratios calculated strictly from official data without external modeling. (e.g. DGCA Traffic-Derived Weights $w_r = \text{Pax}_r / \sum \text{Pax}$). |
| `[LIVE_COLLECTED]` | Empirical Automated Web Scrapes | Live quotes collected by Playwright adapters with timestamp and SHA-256 cryptographic signature. |
| `[PROJECT_DERIVED]` | Econometric Model Outputs | Chained Short-Jevons indices, spread metrics, and anomaly scores calculated by the platform. |
| `[DEMO]` | Calibrated Simulation Data | Statistically calibrated demonstration quotes used when Live Mode is toggled off or during offline testing. |
| `[UNAVAILABLE]` | Pending Statutory Evidence | Explicitly unobserved data that is intentionally not shown to prevent statistical fabrication. (e.g. Backtest correlation metrics prior to 6-month uninterrupted collection). |

---

### 2. Specific Limitations

#### 1. DGCA Passenger Volume vs Expenditure Share
- **Limitation:** The weights used in APIx ($w_r$) reflect two-way annual passenger traffic volume ($TO + FROM$) from the DGCA matrix, rather than monetary rupee expenditure.
- **Rationale:** Official MoSPI Household Consumer Expenditure Survey (HCES) item weights for individual air routes do not exist. DGCA traffic volume serves as the closest empirical expenditure proxy.
- **Transparency Safeguard:** All screens label these weights as **"DGCA TRAFFIC-DERIVED WEIGHT"**, explicitly disclaiming that they represent official MoSPI CPI item weights.

#### 2. Ancillary & Unbundled Airline Charges
- **Limitation:** Airfares in India often exclude optional ancillary fees (seat assignment, checked baggage over 15kg, onboard meals, priority boarding).
- **Treatment:** In accordance with MoSPI CPI consumption definitions, VayuSutra tracks the all-inclusive mandatory checkout fare for standard non-stop Economy class (including base fare, fuel surcharges, UDF, PSF, and GST). Ancillaries are excluded to maintain item homogeneity.

#### 3. Backtest Status (Rule 2 & Rule 3 Compliance)
- **Status:** `BACKTEST DATA PENDING`.
- **Reason:** In earlier versions of academic prototypes (e.g., V4), a 35-day backtest claiming $r = 0.9858$ was fabricated using `random.uniform()`.
- **Statutory Resolution:** In VayuSutra v2.0.0, all fabricated correlation metrics were permanently removed. A genuine Pearson correlation ($r$) and MAPE analysis requires an uninterrupted time series of at least 6 consecutive months of empirical live quotes across all 20 corridors. The validation equations and criteria ($r \ge 0.85$, $\text{MAPE} \le 4.5\%$) are documented on the platform, and will execute automatically once this sampling threshold is achieved.
