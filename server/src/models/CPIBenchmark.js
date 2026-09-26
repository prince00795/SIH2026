import mongoose, { Schema } from 'mongoose';

const CPIBenchmarkSchema = new Schema(
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

export const CPIBenchmarkModel = mongoose.models.CPIBenchmark || mongoose.model('CPIBenchmark', CPIBenchmarkSchema);
