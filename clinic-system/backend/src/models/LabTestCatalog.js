import mongoose from 'mongoose';

const labTestCatalogSchema = new mongoose.Schema({
  testName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Hematology', 'Clinical Chemistry', 'Urinalysis', 'Microbiology', 'Immunology/Serology', 'Imaging'],
    required: true
  },
  code: {
    type: String,
    unique: true,
    required: true
  },
  description: String,
  specimenType: {
    type: String,
    required: true
  },
  referenceRanges: {
    male: { min: Number, max: Number },
    female: { min: Number, max: Number },
    child: { min: Number, max: Number }
  },
  units: String,
  criticalValues: {
    low: Number,
    high: Number
  },
  price: {
    type: Number,
    required: true
  },
  turnaroundTime: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

labTestCatalogSchema.index({ category: 1, testName: 1 });

export default mongoose.model('LabTestCatalog', labTestCatalogSchema);
