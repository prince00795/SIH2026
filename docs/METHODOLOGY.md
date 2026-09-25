# VayuSutra Econometric Methodology
## High-Frequency Airfare Price Index (APIx) Calculation Framework

### 1. The Challenge of Dynamic Airfare Measurement
Traditional Consumer Price Index (CPI) methodology relies on monthly physical or digital quote collection for a fixed basket of goods. In civil aviation, however:
1. **Dynamic Revenue Management:** Airlines adjust fares continuously using algorithmic yield management systems based on load factors, competitor actions, and time-to-departure.
2. **Horizon Sensitivity:** A ticket for tomorrow ($T+1$) can cost 2x to 4x the price of the exact same physical seat booked 30 days ahead ($T+30$). Point-in-time sampling without horizon stratification induces massive artificial variance.
3. **Product Churn:** Flight numbers, timings, and fare buckets appear and disappear daily, making standard Laspeyres fixed-basket tracking impossible.

---

### 2. The Short-Jevons Index Formula

To eliminate substitution bias and satisfy statistical axioms (Time Reversal and Circularity tests), VayuSutra uses the **Jevons Geometric Mean** formulation at the elementary level for matched quotes across consecutive days ($t-1$ to $t$):

$$J_{r,h,t} = \left( \prod_{i=1}^{n} \frac{p_{i,r,h,t}}{p_{i,r,h,t-1}} \right)^{1/n} = \exp\left( \frac{1}{n} \sum_{i=1}^{n} \ln\left( \frac{p_{i,r,h,t}}{p_{i,r,h,t-1}} \right) \right)$$

Where:
- $r$: Corridor (e.g., Mumbai - Delhi)
- $h$: Advance booking horizon ($T+1, T+7, T+15, T+30, T+45$)
- $t$: Current observation day
- $n$: Number of matched flight observations between day $t-1$ and day $t$

---

### 3. Advance Booking Horizon Weights ($\alpha_h$)

Because passenger expenditure is distributed across various planning windows, VayuSutra synthesizes the 5 horizons into a corridor-level relative:

$$J_{r,t} = \sum_{h \in H} \alpha_h \cdot J_{r,h,t}$$

| Horizon | Days in Advance | Weight ($\alpha_h$) | Role in Passenger Expenditure |
|:---:|:---:|:---:|---|
| **$T+1$** | 1 Day Ahead | 0.10 | Emergency, corporate, and urgent distress travel |
| **$T+7$** | 7 Days Ahead | 0.20 | Short-notice business travel |
| **$T+15$** | 15 Days Ahead | 0.25 | Standard planned personal and domestic business |
| **$T+30$** | 30 Days Ahead | 0.30 | Core leisure, family, and vacation baseline |
| **$T+45$** | 45 Days Ahead | 0.15 | Advance festival and vacation planners |

$$\sum_{h} \alpha_h = 1.00$$

---

### 4. DGCA Traffic-Derived National Weighting ($w_r$)

The national aggregate price relative $J_{\text{National},t}$ is derived by weighting corridor price relatives by their share of two-way passenger traffic from the statutory DGCA Scheduled Domestic Passenger Traffic matrix (2022-23 release, 136,028,655 total passengers):

$$w_r = \frac{\text{Pax}_r}{\sum_{j \in \text{Basket}} \text{Pax}_j}$$

$$J_{\text{National},t} = \sum_{r \in \text{Basket}} w_r \cdot J_{r,t}$$

---

### 5. Cumulative Daily Chaining

The National APIx index is initialized at 100.00 on Day 0 and chained forward daily:

$$I_0 = 100.00$$
$$I_t = I_{t-1} \times J_{\text{National},t}$$

Chaining eliminates the reliance on a static base period, allowing new flight routes, airlines, and schedules to enter the basket without retroactive recalculations.
