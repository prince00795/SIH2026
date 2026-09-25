import mongoose, { Schema, Document } from 'mongoose';

export interface IRoute extends Document {
  routeCode: string;          // e.g. "DEL-BOM"
  originCity: string;         // e.g. "New Delhi"
  destinationCity: string;    // e.g. "Mumbai"
  originIATA: string;         // e.g. "DEL"
  destinationIATA: string;    // e.g. "BOM"
  distanceKm: number;
  isMetroMetro: boolean;
  twoWayTrafficAnnual: number;
  rankInNetwork: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RouteSchema = new Schema<IRoute>(
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

export const RouteModel = mongoose.models.Route || mongoose.model<IRoute>('Route', RouteSchema);
