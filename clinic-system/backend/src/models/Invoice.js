import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  invoiceId: {
    type: String,
    unique: true,
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  items: [{
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['Consultation', 'Lab Test', 'Medication', 'Procedure', 'Certificate', 'Other'],
      required: true
    },
    quantity: {
      type: Number,
      default: 1
    },
    unitPrice: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'items.refModel'
    },
    refModel: {
      type: String,
      enum: ['LabRequest', 'MedicalRecord', 'MedicalCertificate']
    }
  }],
  subtotal: {
    type: Number,
    required: true
  },
  taxRate: {
    type: Number,
    default: 0.15
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  discountReason: String,
  totalAmount: {
    type: Number,
    required: true
  },
  payments: [{
    amount: {
      type: Number,
      required: true
    },
    method: {
      type: String,
      enum: ['Cash', 'Card', 'Insurance', 'Bank Transfer', 'Mobile Money'],
      required: true
    },
    transactionRef: String,
    paidAt: {
      type: Date,
      default: Date.now
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  totalPaid: {
    type: Number,
    default: 0
  },
  balanceDue: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Partial', 'Paid', 'Cancelled'],
    default: 'Pending'
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

invoiceSchema.index({ invoiceId: 1 });
invoiceSchema.index({ patientId: 1, status: 1 });
invoiceSchema.pre('save', function(next) {
  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
  this.taxAmount = this.subtotal * this.taxRate;
  this.totalAmount = this.subtotal + this.taxAmount - this.discount;
  this.balanceDue = this.totalAmount - this.totalPaid;
  
  if (this.balanceDue <= 0) {
    this.status = 'Paid';
  } else if (this.totalPaid > 0) {
    this.status = 'Partial';
  } else {
    this.status = 'Pending';
  }
  
  next();
});

export default mongoose.model('Invoice', invoiceSchema);
