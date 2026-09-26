import mongoose, { Schema } from 'mongoose';

const ScrapeRunSchema = new Schema(
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

export const ScrapeRunModel = mongoose.models.ScrapeRun || mongoose.model('ScrapeRun', ScrapeRunSchema);
