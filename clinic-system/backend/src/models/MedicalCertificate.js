import mongoose from 'mongoose';

const medicalCertificateSchema = new mongoose.Schema({
  certificateId: {
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
  type: {
    type: String,
    enum: ['Fitness', 'Sick-Leave', 'Disability', 'Report'],
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  validFrom: Date,
  validUntil: Date,
  diagnosis: String,
  recommendations: String,
  restrictions: [String],
  isRevoked: {
    type: Boolean,
    default: false
  },
  revocationReason: String,
  revokedAt: Date,
  revokedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  printCount: {
    type: Number,
    default: 0
  },
  digitalSignature: String,
  qrCodeData: String,
  headerSection: {
    clinicName: String,
    clinicAddress: String,
    clinicPhone: String,
    clinicEmail: String,
    logo: String
  },
  patientInformationSection: {
    fullName: String,
    age: Number,
    gender: String,
    patientId: String,
    address: String,
    phone: String
  },
  vitalSignsSection: {
    temperature: Number,
    bloodPressure: { systolic: Number, diastolic: Number },
    pulseRate: Number,
    respiratoryRate: Number,
    oxygenSaturation: Number,
    weight: Number,
    height: Number,
    bmi: Number
  },
  clinicalExaminationSection: {
    generalAppearance: String,
    systemicExamination: [{
      system: String,
      findings: String
    }],
    specificFindings: String
  },
  laboratoryInvestigationSection: [{
    testName: String,
    result: String,
    referenceRange: String,
    flag: String,
    date: Date
  }],
  footerSection: {
    finalResult: String,
    declaration: String,
    doctorName: String,
    doctorLicense: String,
    doctorSignature: String,
    stamp: String,
    issueDateTime: Date
  },
  notes: String
}, {
  timestamps: true
});

medicalCertificateSchema.index({ certificateId: 1 });
medicalCertificateSchema.index({ patientId: 1, type: 1 });

export default mongoose.model('MedicalCertificate', medicalCertificateSchema);
