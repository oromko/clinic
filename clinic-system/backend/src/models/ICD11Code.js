import mongoose from 'mongoose';

const icd11CodeSchema = new mongoose.Schema({
  chapter: {
    type: String,
    required: true,
    index: true
  },
  code: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  parentCode: String,
  level: Number
}, {
  timestamps: true
});

icd11CodeSchema.index({ code: 1, description: 'text' });

export default mongoose.model('ICD11Code', icd11CodeSchema);
