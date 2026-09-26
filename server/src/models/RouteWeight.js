import mongoose, { Schema } from 'mongoose';

const BasketRouteItemSchema = new Schema(
  {
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
  },
  { _id: false }
);

const RouteWeightVersionSchema = new Schema(
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

export const RouteWeightModel = mongoose.models.RouteWeight || mongoose.model('RouteWeight', RouteWeightVersionSchema);
