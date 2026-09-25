import mongoose, { Schema, Document } from 'mongoose';

export interface IIndexObservation extends Document {
  date: string;               // "YYYY-MM-DD"
  routeCode: string;          // e.g. "DEL-BOM"
  advanceWindow: 'T+1' | 'T+7' | 'T+15' | 'T+30' | 'T+45';
  mode: 'LIVE' | 'DEMO';
  sampleSize: number;
  jevonsMeanFare: number;     // exp(1/n * sum(ln(p)))
  previousJevonsMeanFare?: number;
  shortJevonsFactor: number;  // current / previous
  status: 'CALCULATED' | 'INSUFFICIENT_DATA';
  createdAt: Date;
}

const IndexObservationSchema = new Schema<IIndexObservation>(
  {
    date: { type: String, required: true, index: true },
    routeCode: { type: String, required: true, index: true },
    advanceWindow: { type: String, enum: ['T+1', 'T+7', 'T+15', 'T+30', 'T+45'], required: true, index: true },
    mode: { type: String, enum: ['LIVE', 'DEMO'], required: true, index: true },
    sampleSize: { type: Number, required: true },
    jevonsMeanFare: { type: Number, required: true },
    previousJevonsMeanFare: { type: Number },
    shortJevonsFactor: { type: Number, default: 1.0 },
    status: { type: String, enum: ['CALCULATED', 'INSUFFICIENT_DATA'], default: 'CALCULATED' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

IndexObservationSchema.index({ date: 1, routeCode: 1, advanceWindow: 1, mode: 1 }, { unique: true });

export const IndexObservationModel = mongoose.models.IndexObservation || mongoose.model<IIndexObservation>('IndexObservation', IndexObservationSchema);
