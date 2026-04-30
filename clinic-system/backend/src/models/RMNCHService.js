import mongoose from 'mongoose';

const rmnchServiceSchema = new mongoose.Schema({
  serviceId: {
    type: String,
    unique: true,
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  serviceType: {
    type: String,
    enum: ['Antenatal Care', 'Postnatal Care', 'Family Planning', 'Child Immunization', 'Child Growth Monitoring', 'Maternal Nutrition', 'Newborn Care', 'Adolescent Health'],
    required: true
  },
  category: {
    type: String,
    enum: ['Reproductive', 'Maternal', 'Neonatal', 'Child'],
    required: true
  },
  visitDate: {
    type: Date,
    default: Date.now
  },
  gestationalAge: {
    weeks: Number,
    days: Number
  },
  gravida: Number,
  para: Number,
  abortions: Number,
  livingChildren: Number,
  expectedDeliveryDate: Date,
  maternalAge: Number,
  childAge: {
    months: Number,
    years: Number
  },
  immunizations: [{
    vaccine: String,
    dose: Number,
    dateGiven: Date,
    nextDueDate: Date,
    batchNumber: String,
    givenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  growthMeasurements: [{
    date: Date,
    weight: Number,
    height: Number,
    headCircumference: Number,
    midUpperArmCircumference: Number,
    weightForAge: String,
    heightForAge: String,
    weightForHeight: String,
    bmi: Number,
    zScore: Number
  }],
  familyPlanningMethod: {
    method: String,
    startDate: Date,
    endDate: Date,
    sideEffects: [String],
    followUpDate: Date
  },
  antenatalCare: {
    visitNumber: Number,
    trimester: { type: String, enum: ['First', 'Second', 'Third'] },
    bloodPressure: { systolic: Number, diastolic: Number },
    fundalHeight: Number,
    fetalHeartRate: Number,
    fetalPosition: String,
    edema: Boolean,
    proteinuria: Boolean,
    supplements: [{
      name: String,
      dosage: String,
      frequency: String
    }],
    riskFactors: [String],
    counselingProvided: [String]
  },
  postnatalCare: {
    visitNumber: Number,
    deliveryDate: Date,
    deliveryPlace: String,
    deliveryType: { type: String, enum: ['Vaginal', 'Cesarean', 'Assisted Vaginal'] },
    complications: [String],
    breastfeedingStatus: { type: String, enum: ['Exclusive', 'Partial', 'None'] },
    maternalRecovery: String,
    newbornCondition: String
  },
  newbornCare: {
    birthWeight: Number,
    birthLength: Number,
    apgarScore: { oneMinute: Number, fiveMinute: Number },
    feedingMethod: String,
    cordCare: String,
    screeningTests: [{
      test: String,
      result: String,
      date: Date
    }]
  },
  signsAndSymptoms: [{
    symptom: String,
    severity: { type: String, enum: ['Mild', 'Moderate', 'Severe'] },
    onset: Date,
    notes: String
  }],
  interventions: [{
    intervention: String,
    description: String,
    date: Date,
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  referrals: [{
    facility: String,
    reason: String,
    date: Date,
    status: { type: String, enum: ['Pending', 'Completed', 'Cancelled'] }
  }],
  nextVisitDate: Date,
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Discharged', 'Transferred', 'Lost to Follow-up'],
    default: 'Active'
  },
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

rmnchServiceSchema.index({ patientId: 1, serviceType: 1 });
rmnchServiceSchema.index({ category: 1, visitDate: -1 });
rmnchServiceSchema.index({ serviceId: 1 });

export default mongoose.model('RMNCHService', rmnchServiceSchema);
