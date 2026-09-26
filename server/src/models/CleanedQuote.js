import mongoose, { Schema } from 'mongoose';

const CleanedQuoteSchema = new Schema(
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

export const CleanedQuoteModel = mongoose.models.CleanedQuote || mongoose.model('CleanedQuote', CleanedQuoteSchema);
