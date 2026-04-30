import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    unique: true,
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  address: {
    street: String,
    city: String,
    region: String,
    postalCode: String
  },
  nextOfKin: {
    name: String,
    relationship: String,
    phone: String,
    address: String
  },
  medicalHistory: {
    allergies: [String],
    chronicConditions: [String],
    medications: [String],
    surgeries: [String]
  },
  bloodType: String,
  insuranceInfo: {
    provider: String,
    policyNumber: String,
    groupNumber: String
  }
}, {
  timestamps: true
});

patientSchema.index({ patientId: 1 });
patientSchema.index({ firstName: 1, lastName: 1 });

export default mongoose.model('Patient', patientSchema);
