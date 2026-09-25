import mongoose, { Schema, Document } from 'mongoose';

export interface IIndexSeries extends Document {
  date: string;               // "YYYY-MM-DD"
  mode: 'LIVE' | 'DEMO';
  seriesType: 'NATIONAL' | 'ROUTE';
  targetCode: string;         // 'NATIONAL' or routeCode (e.g. 'DEL-BOM')
  horizon: 'T+1' | 'T+7' | 'T+15' | 'T+30' | 'T+45' | 'COMPOSITE';
  indexValue: number;         // Chained value initialized at 100.00
  dailyChangePct: number;
  shortJevonsFactor: number;  // Multiplier from previous period
  routeWeightVersion?: string;
  methodologyLabel: 'SHORT_JEVONS_CHAINED';
  sampleQuotesCount: number;
  createdAt: Date;
}

const IndexSeriesSchema = new Schema<IIndexSeries>(
  {
    date: { type: String, required: true, index: true },
    mode: { type: String, enum: ['LIVE', 'DEMO'], required: true, index: true },
    seriesType: { type: String, enum: ['NATIONAL', 'ROUTE'], required: true, index: true },
    targetCode: { type: String, required: true, index: true },
    horizon: { type: String, enum: ['T+1', 'T+7', 'T+15', 'T+30', 'T+45', 'COMPOSITE'], required: true, index: true },
    indexValue: { type: Number, required: true },
    dailyChangePct: { type: Number, default: 0.0 },
    shortJevonsFactor: { type: Number, default: 1.0 },
    routeWeightVersion: { type: String },
    methodologyLabel: { type: String, default: 'SHORT_JEVONS_CHAINED' },
    sampleQuotesCount: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

IndexSeriesSchema.index({ date: 1, mode: 1, seriesType: 1, targetCode: 1, horizon: 1 }, { unique: true });

export const IndexSeriesModel = mongoose.models.IndexSeries || mongoose.model<IIndexSeries>('IndexSeries', IndexSeriesSchema);
