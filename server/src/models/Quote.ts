import mongoose, { Schema, Document } from 'mongoose';

export interface IQuote extends Document {
  quoteId: string;            // Unique UUID
  sourceType: 'AIRLINE' | 'OTA';
  sourceName: string;         // 'IndiGo' | 'Air India' | 'MakeMyTrip' etc.
  mode: 'LIVE' | 'DEMO';
  routeCode: string;          // e.g. "DEL-BOM"
  origin: string;             // "DEL"
  destination: string;        // "BOM"
  collectionTimestamp: Date;
  departureDate: string;      // "YYYY-MM-DD"
  advanceWindow: 'T+1' | 'T+7' | 'T+15' | 'T+30' | 'T+45';
  advanceDays: number;        // 1, 7, 15, 30, 45
  carrierCode: string;        // "6E"
  carrierName: string;        // "IndiGo"
  flightNumber: string;       // "6E-201"
  departureTime: string;      // "06:00"
  arrivalTime: string;        // "08:15"
  isDirect: boolean;
  fareClass: string;          // "Economy"
  baseFare: number | null;    // null if unexposed
  fuelSurcharge: number | null;
  taxes: number | null;
  udf: number | null;
  convenienceFee: number | null;
  totalFare: number;          // Gross total payable
  currency: string;           // "INR"
  sha256Signature: string;    // Cryptographic audit fingerprint
  parserVersion: string;
  rawDataRef?: string;
  status: 'RAW_INGESTED' | 'PARSER_WARNING' | 'INVALID';
  createdAt: Date;
}

const QuoteSchema = new Schema<IQuote>(
  {
    quoteId: { type: String, required: true, unique: true, index: true },
    sourceType: { type: String, enum: ['AIRLINE', 'OTA'], required: true },
    sourceName: { type: String, required: true, index: true },
    mode: { type: String, enum: ['LIVE', 'DEMO'], required: true, index: true },
    routeCode: { type: String, required: true, index: true },
    origin: { type: String, required: true, index: true },
    destination: { type: String, required: true, index: true },
    collectionTimestamp: { type: Date, required: true, index: true },
    departureDate: { type: String, required: true, index: true },
    advanceWindow: { type: String, enum: ['T+1', 'T+7', 'T+15', 'T+30', 'T+45'], required: true, index: true },
    advanceDays: { type: Number, required: true },
    carrierCode: { type: String, required: true },
    carrierName: { type: String, required: true },
    flightNumber: { type: String, required: true },
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    isDirect: { type: Boolean, default: true },
    fareClass: { type: String, default: 'Economy' },
    baseFare: { type: Number, default: null },
    fuelSurcharge: { type: Number, default: null },
    taxes: { type: Number, default: null },
    udf: { type: Number, default: null },
    convenienceFee: { type: Number, default: null },
    totalFare: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    sha256Signature: { type: String, required: true },
    parserVersion: { type: String, default: '2.0.0' },
    rawDataRef: { type: String },
    status: { type: String, enum: ['RAW_INGESTED', 'PARSER_WARNING', 'INVALID'], default: 'RAW_INGESTED' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Compound indexes for high-frequency queries
QuoteSchema.index({ routeCode: 1, departureDate: 1, advanceWindow: 1 });
QuoteSchema.index({ sourceName: 1, collectionTimestamp: -1 });

export const QuoteModel = mongoose.models.Quote || mongoose.model<IQuote>('Quote', QuoteSchema);
