import mongoose, { Schema, Document } from 'mongoose';

export interface ISourceHealth extends Document {
  sourceName: string;         // e.g. "IndiGo", "MakeMyTrip"
  sourceType: 'AIRLINE' | 'OTA';
  portalUrl: string;
  currentStatus: 'LIVE' | 'PARTIAL' | 'BLOCKED' | 'UNAVAILABLE' | 'ERROR' | 'DEMO' | 'NOT_CONFIGURED';
  lastAttemptAt?: Date;
  lastSuccessAt?: Date;
  successCount24h: number;
  failureCount24h: number;
  lastHttpCode?: number;
  lastErrorMessage?: string;
  avgLatencyMs: number;
  quotesIngestedLastRun: number;
  updatedAt: Date;
}

const SourceHealthSchema = new Schema<ISourceHealth>(
  {
    sourceName: { type: String, required: true, unique: true, index: true },
    sourceType: { type: String, enum: ['AIRLINE', 'OTA'], required: true },
    portalUrl: { type: String, required: true },
    currentStatus: {
      type: String,
      enum: ['LIVE', 'PARTIAL', 'BLOCKED', 'UNAVAILABLE', 'ERROR', 'DEMO', 'NOT_CONFIGURED'],
      default: 'NOT_CONFIGURED',
      index: true,
    },
    lastAttemptAt: { type: Date },
    lastSuccessAt: { type: Date },
    successCount24h: { type: Number, default: 0 },
    failureCount24h: { type: Number, default: 0 },
    lastHttpCode: { type: Number },
    lastErrorMessage: { type: String },
    avgLatencyMs: { type: Number, default: 0 },
    quotesIngestedLastRun: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const SourceHealthModel = mongoose.models.SourceHealth || mongoose.model<ISourceHealth>('SourceHealth', SourceHealthSchema);
