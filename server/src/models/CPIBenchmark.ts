import mongoose, { Schema, Document } from 'mongoose';

export interface ICPIBenchmark extends Document {
  year: number;
  month: string;              // "January", "February", etc.
  monthNum: number;           // 1 to 12
  date: string;               // "2025-01", "2026-08"
  itemCode: string;           // "07.3.3.1.2.01"
  itemName: string;           // "Airfare"
  division: string;           // "07 Transport"
  group: string;              // "07.3 Passenger transport services"
  baseYear: string;           // "2024=100"
  sector: string;             // "All India Combined"
  indexValue: number;         // Published CPI index
  inflationPct: number | null;// YoY inflation if reported
  status: 'OFFICIAL';
  sourceDocument: string;
  createdAt: Date;
}

const CPIBenchmarkSchema = new Schema<ICPIBenchmark>(
  {
    year: { type: Number, required: true, index: true },
    month: { type: String, required: true },
    monthNum: { type: Number, required: true },
    date: { type: String, required: true, unique: true, index: true },
    itemCode: { type: String, default: '07.3.3.1.2.01' },
    itemName: { type: String, default: 'Airfare' },
    division: { type: String, default: '07 Transport' },
    group: { type: String, default: '07.3 Passenger transport services' },
    baseYear: { type: String, default: '2024=100' },
    sector: { type: String, default: 'All India Combined' },
    indexValue: { type: Number, required: true },
    inflationPct: { type: Number, default: null },
    status: { type: String, default: 'OFFICIAL' },
    sourceDocument: { type: String, default: 'MoSPI CPI Press Release / Official Dataset' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const CPIBenchmarkModel = mongoose.models.CPIBenchmark || mongoose.model<ICPIBenchmark>('CPIBenchmark', CPIBenchmarkSchema);
