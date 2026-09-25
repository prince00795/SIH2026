import mongoose, { Schema, Document } from 'mongoose';

export interface ICleanedQuote extends Document {
  cleanedId: string;
  rawQuoteId: string;
  mode: 'LIVE' | 'DEMO';
  routeCode: string;
  advanceWindow: 'T+1' | 'T+7' | 'T+15' | 'T+30' | 'T+45';
  departureDate: string;
  carrierCode: string;
  flightNumber: string;
  totalFare: number;
  deduplicationStatus: 'ORIGINAL_KEPT' | 'OTA_DUPLICATE_DROPPED';
  qualityFlags: string[];     // ["VALID", "DUPLICATE", "MISSING_TAX", "OUTLIER_REVIEW"]
  cleaningVersion: string;
  cleanedAt: Date;
}

const CleanedQuoteSchema = new Schema<ICleanedQuote>(
  {
    cleanedId: { type: String, required: true, unique: true, index: true },
    rawQuoteId: { type: String, required: true, index: true },
    mode: { type: String, enum: ['LIVE', 'DEMO'], required: true, index: true },
    routeCode: { type: String, required: true, index: true },
    advanceWindow: { type: String, required: true, index: true },
    departureDate: { type: String, required: true, index: true },
    carrierCode: { type: String, required: true },
    flightNumber: { type: String, required: true },
    totalFare: { type: Number, required: true },
    deduplicationStatus: { type: String, enum: ['ORIGINAL_KEPT', 'OTA_DUPLICATE_DROPPED'], default: 'ORIGINAL_KEPT' },
    qualityFlags: { type: [String], default: ['VALID'] },
    cleaningVersion: { type: String, default: 'V1.0-MAD-DEDUP' },
    cleanedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

CleanedQuoteSchema.index({ routeCode: 1, advanceWindow: 1, departureDate: 1 });

export const CleanedQuoteModel = mongoose.models.CleanedQuote || mongoose.model<ICleanedQuote>('CleanedQuote', CleanedQuoteSchema);
