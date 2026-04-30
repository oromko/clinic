import mongoose from 'mongoose';

const hmisReportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    unique: true,
    required: true
  },
  reportType: {
    type: String,
    enum: ['Daily', 'Monthly', 'Disease Surveillance', 'Financial'],
    required: true
  },
  period: {
    start: Date,
    end: Date
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  data: {
    patientCount: Number,
    newPatients: Number,
    returnPatients: Number,
    appointmentsCompleted: Number,
    labTestsPerformed: Number,
    certificatesIssued: Number,
    revenue: {
      total: Number,
      byCategory: {
        consultation: Number,
        labTests: Number,
        medications: Number,
        procedures: Number,
        certificates: Number
      }
    },
    topDiagnoses: [{
      icdCode: String,
      description: String,
      count: Number
    }],
    demographics: {
      byAgeGroup: {
        under5: Number,
        age5to14: Number,
        age15to24: Number,
        age25to44: Number,
        age45to64: Number,
        over65: Number
      },
      byGender: {
        male: Number,
        female: Number,
        other: Number
      }
    }
  },
  exportedFormats: [String],
  exportLogs: [{
    format: String,
    exportedAt: Date,
    exportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true
});

hmisReportSchema.index({ reportType: 1, period: 1 });

export default mongoose.model('HMISReport', hmisReportSchema);
