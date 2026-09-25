import mongoose, { Schema, Document } from 'mongoose';

export interface IBasketRouteItem {
  routeCode: string;
  originCity: string;
  destinationCity: string;
  originIATA: string;
  destinationIATA: string;
  passengersTo: number;
  passengersFrom: number;
  totalTwoWayTraffic: number;
  rank: number;
  weightInBasket: number;     // Normalized sum to 1.000000
  networkSharePct: number;
  weightLabel: 'DGCA TRAFFIC-DERIVED WEIGHT';
}

export interface IRouteWeightVersion extends Document {
  versionId: string;          // e.g. "RW-DGCA-2022-23-TOP20"
  sourceDocument: string;     // "CITY PAIR WISE SCHEDULED DOMESTIC PASSENGER TRAFFIC STATISTICS FOR THE YEAR 2022-23"
  reportingAgency: string;    // "Directorate General of Civil Aviation (DGCA)"
  method: 'TWO_WAY_PASSENGER_TRAFFIC_SHARE';
  topN: number;               // 20
  totalNetworkTraffic: number;// 136,028,655
  basketTotalTraffic: number;
  coveragePct: number;        // Top N share of total national traffic
  effectiveFrom: Date;
  status: 'ACTIVE' | 'ARCHIVED';
  routes: IBasketRouteItem[];
  createdAt: Date;
  updatedAt: Date;
}

const BasketRouteItemSchema = new Schema<IBasketRouteItem>({
  routeCode: { type: String, required: true },
  originCity: { type: String, required: true },
  destinationCity: { type: String, required: true },
  originIATA: { type: String, required: true },
  destinationIATA: { type: String, required: true },
  passengersTo: { type: Number, required: true },
  passengersFrom: { type: Number, required: true },
  totalTwoWayTraffic: { type: Number, required: true },
  rank: { type: Number, required: true },
  weightInBasket: { type: Number, required: true },
  networkSharePct: { type: Number, required: true },
  weightLabel: { type: String, default: 'DGCA TRAFFIC-DERIVED WEIGHT' },
}, { _id: false });

const RouteWeightVersionSchema = new Schema<IRouteWeightVersion>(
  {
    versionId: { type: String, required: true, unique: true, index: true },
    sourceDocument: { type: String, required: true },
    reportingAgency: { type: String, default: 'Directorate General of Civil Aviation (DGCA)' },
    method: { type: String, default: 'TWO_WAY_PASSENGER_TRAFFIC_SHARE' },
    topN: { type: Number, required: true, default: 20 },
    totalNetworkTraffic: { type: Number, required: true },
    basketTotalTraffic: { type: Number, required: true },
    coveragePct: { type: Number, required: true },
    effectiveFrom: { type: Date, default: Date.now },
    status: { type: String, enum: ['ACTIVE', 'ARCHIVED'], default: 'ACTIVE' },
    routes: [BasketRouteItemSchema],
  },
  { timestamps: true }
);

export const RouteWeightModel = mongoose.models.RouteWeight || mongoose.model<IRouteWeightVersion>('RouteWeight', RouteWeightVersionSchema);
