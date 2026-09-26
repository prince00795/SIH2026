import mongoose, { Schema } from 'mongoose';

const BacktestRunSchema = new Schema(
  {
    backtestId: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ['PENDING_DATA', 'EXECUTED', 'FAILED'],
      default: 'PENDING_DATA',
    },
    evaluatedAt: { type: Date, default: Date.now },
    dataRequirements: [{ type: String }],
    metrics: {
      pearsonR: { type: Number, default: null },
      rSquared: { type: Number, default: null },
      mape: { type: Number, default: null },
      rmse: { type: Number, default: null },
    },
    sampleSizeMonths: { type: Number, default: 0 },
    notes: { type: String, default: 'Historical 6-month uninterrupted scrape data pending.' },
  },
  { timestamps: true }
);

export const BacktestRunModel = mongoose.models.BacktestRun || mongoose.model('BacktestRun', BacktestRunSchema);
