import mongoose, { Schema, Document } from 'mongoose';

export interface IScrapeRunSourceResult {
  sourceName: string;
  sourceType: 'AIRLINE' | 'OTA';
  status: 'SUCCESS' | 'BLOCKED' | 'ERROR' | 'UNAVAILABLE' | 'NOT_TESTED';
  quotesCount: number;
  latencyMs: number;
  error?: string;
}

export interface IScrapeRun {
  scrapeRunId: string;
  status: 'STARTED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PARTIAL';
  mode: 'LIVE' | 'DEMO';
  sources: string[];
  routes: string[];
  advanceWindows: string[];
  startedAt: Date;
  completedAt?: Date;
  quotesCollected: number;
  quotesValid: number;
  quotesRejected: number;
  errors: Array<{
    source: string;
    route?: string;
    error: string;
    timestamp: Date;
  }>;
  sourceResults: IScrapeRunSourceResult[];
}

const ScrapeRunSchema = new Schema<IScrapeRun>(
  {
    scrapeRunId: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ['STARTED', 'RUNNING', 'COMPLETED', 'FAILED', 'PARTIAL'],
      default: 'STARTED',
    },
    mode: { type: String, enum: ['LIVE', 'DEMO'], default: 'DEMO' },
    sources: [{ type: String }],
    routes: [{ type: String }],
    advanceWindows: [{ type: String }],
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    quotesCollected: { type: Number, default: 0 },
    quotesValid: { type: Number, default: 0 },
    quotesRejected: { type: Number, default: 0 },
    errors: [
      {
        source: { type: String },
        route: { type: String },
        error: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    sourceResults: [
      {
        sourceName: { type: String },
        sourceType: { type: String, enum: ['AIRLINE', 'OTA'] },
        status: {
          type: String,
          enum: ['SUCCESS', 'BLOCKED', 'ERROR', 'UNAVAILABLE', 'NOT_TESTED'],
          default: 'NOT_TESTED',
        },
        quotesCount: { type: Number, default: 0 },
        latencyMs: { type: Number, default: 0 },
        error: { type: String },
      },
    ],
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

export const ScrapeRunModel = mongoose.model<IScrapeRun>('ScrapeRun', ScrapeRunSchema);
