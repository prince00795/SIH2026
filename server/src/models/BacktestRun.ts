import mongoose, { Schema, Document } from 'mongoose';

export interface IBacktestRun extends Document {
  backtestId: string;
  status: 'PENDING_DATA' | 'EXECUTED' | 'FAILED';
  evaluatedAt: Date;
  dataRequirements: string[];
  metrics: {
    pearsonR: number | null;
    rSquared: number | null;
    mape: number | null;
    rmse: number | null;
  };
  sampleSizeMonths: number;
  notes: string;
}

const BacktestRunSchema = new Schema<IBacktestRun>(
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

export const BacktestRunModel = mongoose.model<IBacktestRun>('BacktestRun', BacktestRunSchema);
