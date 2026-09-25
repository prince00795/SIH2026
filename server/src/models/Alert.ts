import mongoose, { Schema, Document } from 'mongoose';

export interface IAlert extends Document {
  alertId: string;
  type: 'PRICE_SPIKE' | 'HORIZON_INVERSION' | 'SOURCE_FAILURE' | 'DATA_QUALITY_DROP' | 'CORRIDOR_DIVERGENCE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  routeCode?: string;
  sourceName?: string;
  metricValue?: number;
  thresholdValue?: number;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  timestamp: Date;
}

const AlertSchema = new Schema<IAlert>(
  {
    alertId: { type: String, required: true, unique: true, index: true },
    type: { type: String, required: true, index: true },
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    routeCode: { type: String, index: true },
    sourceName: { type: String, index: true },
    metricValue: { type: Number },
    thresholdValue: { type: Number },
    status: { type: String, enum: ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'], default: 'ACTIVE', index: true },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

export const AlertModel = mongoose.models.Alert || mongoose.model<IAlert>('Alert', AlertSchema);
