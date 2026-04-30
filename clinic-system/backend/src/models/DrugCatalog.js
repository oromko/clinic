import mongoose from 'mongoose';

const drugCatalogSchema = new mongoose.Schema({
  drugId: {
    type: String,
    unique: true,
    required: true
  },
  genericName: {
    type: String,
    required: true,
    trim: true
  },
  brandNames: [String],
  category: {
    type: String,
    enum: ['Antibiotics', 'Analgesics', 'Antipyretics', 'Anti-inflammatory', 'Antihypertensives', 'Antidiabetics', 'Antimalarials', 'Antiretrovirals', 'Vitamins/Supplements', 'Gastrointestinal', 'Respiratory', 'Dermatological', 'Hormonal', 'Psychotropic', 'Antihistamines', 'Anthelmintics'],
    required: true
  },
  subCategory: String,
  dosageForm: {
    type: String,
    enum: ['Tablet', 'Capsule', 'Syrup', 'Suspension', 'Injection', 'Cream', 'Ointment', 'Drops', 'Inhaler', 'Suppository', 'Powder', 'Solution']
  },
  strength: String,
  route: {
    type: String,
    enum: ['Oral', 'Intravenous', 'Intramuscular', 'Subcutaneous', 'Topical', 'Inhalation', 'Rectal', 'Vaginal', 'Sublingual', 'Transdermal']
  },
  standardDosage: {
    adult: String,
    pediatric: String,
    geriatric: String,
    pregnantWomen: String
  },
  frequency: {
    type: String,
    enum: ['Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'Every 6 hours', 'Every 8 hours', 'Every 12 hours', 'As needed', 'Single dose']
  },
  duration: String,
  indications: [String],
  contraindications: [String],
  sideEffects: [String],
  drugInteractions: [String],
  warnings: [String],
  pregnancyCategory: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'X', 'Not Classified']
  },
  lactationSafety: {
    type: String,
    enum: ['Safe', 'Use with Caution', 'Contraindicated', 'Unknown']
  },
  storageConditions: String,
  shelfLife: String,
  manufacturer: String,
  price: Number,
  stockQuantity: {
    type: Number,
    default: 0
  },
  reorderLevel: Number,
  requiresPrescription: {
    type: Boolean,
    default: true
  },
  controlledSubstance: {
    type: Boolean,
    default: false
  },
  essentialMedicine: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

drugCatalogSchema.index({ genericName: 'text', brandNames: 'text' });
drugCatalogSchema.index({ category: 1 });

export default mongoose.model('DrugCatalog', drugCatalogSchema);
