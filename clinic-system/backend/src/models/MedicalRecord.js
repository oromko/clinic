import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
  recordId: {
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
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  visitDate: {
    type: Date,
    default: Date.now
  },
  chiefComplaint: String,
  historyOfPresentIllness: String,
  vitals: {
    temperature: Number,
    bloodPressure: { systolic: Number, diastolic: Number },
    heartRate: Number,
    respiratoryRate: Number,
    oxygenSaturation: Number,
    weight: Number,
    height: Number,
    bmi: Number
  },
  physicalExamination: String,
  diagnoses: [{
    icdCode: String,
    description: String,
    type: { type: String, enum: ['primary', 'secondary'] }
  }],
  treatmentPlan: String,
  prescriptions: [{
    medication: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String
  }],
  labRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabRequest'
  }],
  followUpDate: Date,
  notes: String
}, {
  timestamps: true
});

medicalRecordSchema.index({ patientId: 1, visitDate: -1 });

export default mongoose.model('MedicalRecord', medicalRecordSchema);
