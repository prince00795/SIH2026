import mongoose, { Schema } from 'mongoose';

const IndexObservationSchema = new Schema(
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

export const IndexObservationModel = mongoose.models.IndexObservation || mongoose.model('IndexObservation', IndexObservationSchema);
