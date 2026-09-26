import mongoose, { Schema } from 'mongoose';

const ProvenanceSchema = new Schema(
  {
    provenanceId: { type: String, required: true, unique: true, index: true },
    targetType: {
      type: String,
      enum: ['QUOTE', 'DGCA_MATRIX', 'MOSPI_CPI', 'INDEX_SERIES'],
      required: true,
    },
    targetId: { type: String, required: true, index: true },
    sourceAuthority: {
      type: String,
      enum: ['DGCA', 'MOSPI', 'AIRLINE', 'OTA'],
      required: true,
    },
    datasetName: { type: String, required: true },
    documentTitle: { type: String },
    sha256Digest: { type: String, required: true },
    canonicalPayload: { type: String },
    transformationApplied: { type: String, required: true },
    recordedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['VERIFIED', 'TAMPER_FLAGGED'], default: 'VERIFIED' },
  },
  { timestamps: true }
);

export const ProvenanceModel = mongoose.models.Provenance || mongoose.model('Provenance', ProvenanceSchema);
