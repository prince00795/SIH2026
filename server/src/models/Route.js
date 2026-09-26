import mongoose, { Schema } from 'mongoose';

const RouteSchema = new Schema(
  {
    routeCode: { type: String, required: true, unique: true, index: true },
    originCity: { type: String, required: true },
    destinationCity: { type: String, required: true },
    originIATA: { type: String, required: true, index: true },
    destinationIATA: { type: String, required: true, index: true },
    distanceKm: { type: Number, default: 0 },
    isMetroMetro: { type: Boolean, default: false },
    twoWayTrafficAnnual: { type: Number, default: 0 },
    rankInNetwork: { type: Number, default: 999 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const RouteModel = mongoose.models.Route || mongoose.model('Route', RouteSchema);
