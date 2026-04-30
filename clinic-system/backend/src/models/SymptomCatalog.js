import mongoose from 'mongoose';

const symptomCatalogSchema = new mongoose.Schema({
  symptomId: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['General', 'Respiratory', 'Cardiovascular', 'Gastrointestinal', 'Neurological', 'Musculoskeletal', 'Dermatological', 'Genitourinary', 'Reproductive', 'Pediatric', 'Obstetric'],
    required: true
  },
  description: String,
  commonCauses: [String],
  associatedConditions: [{
    icdCode: String,
    condition: String
  }],
  severityLevels: {
    mild: String,
    moderate: String,
    severe: String
  },
  redFlags: [String],
  suggestedInvestigations: [String],
  commonTreatments: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

symptomCatalogSchema.index({ name: 'text', category: 1 });

export default mongoose.model('SymptomCatalog', symptomCatalogSchema);
