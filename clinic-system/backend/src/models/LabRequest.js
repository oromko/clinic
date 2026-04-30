import mongoose from 'mongoose';

const labRequestSchema = new mongoose.Schema({
  labId: {
    type: String,
    unique: true,
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  medicalRecordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRecord'
  },
  tests: [{
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabTestCatalog',
      required: true
    },
    testName: String,
    category: String,
    result: Number,
    units: String,
    referenceRange: { min: Number, max: Number },
    isAbnormal: Boolean,
    flag: { type: String, enum: ['Normal', 'Low', 'High', 'Critical'] },
    notes: String,
    enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    enteredAt: Date,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: Date
  }],
  priority: {
    type: String,
    enum: ['routine', 'urgent', 'stat'],
    default: 'routine'
  },
  status: {
    type: String,
    enum: ['Requested', 'Sample Collected', 'Result Entered', 'Verified', 'Finalized', 'Cancelled'],
    default: 'Requested'
  },
  specimenCollectedAt: Date,
  collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  finalizedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  finalizedAt: Date,
  clinicalNotes: String,
  totalPrice: Number
}, {
  timestamps: true
});

labRequestSchema.index({ labId: 1 });
labRequestSchema.index({ patientId: 1, status: 1 });
labRequestSchema.index({ status: 1, priority: -1 });

export default mongoose.model('LabRequest', labRequestSchema);
