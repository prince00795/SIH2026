import mongoose, { Schema } from 'mongoose';

const AlertSchema = new Schema(
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

export const AlertModel = mongoose.models.Alert || mongoose.model('Alert', AlertSchema);
