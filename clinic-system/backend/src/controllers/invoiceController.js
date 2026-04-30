const Invoice = require('../models/Invoice');
const Patient = require('../models/Patient');

// @desc    Create a new invoice
// @route   POST /api/invoices
// @access  Receptionist, Admin
const createInvoice = async (req, res) => {
  try {
    const { patientId, items, discountPercent, taxRate } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Generate Invoice ID: INV-YYYYMMDD-XXXX
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await Invoice.countDocuments({ 
      createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } 
    });
    const sequence = String(count + 1).padStart(4, '0');
    const invoiceId = `INV-${datePart}-${sequence}`;

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = discountPercent ? (subtotal * discountPercent / 100) : 0;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxRate ? (taxableAmount * taxRate / 100) : 0;
    const total = taxableAmount + taxAmount;

    const invoice = new Invoice({
      invoiceId,
      patient: patientId,
      createdBy: req.user.id,
      items,
      discountPercent: discountPercent || 0,
      discountAmount,
      taxRate: taxRate || 0,
      taxAmount,
      subtotal,
      total,
      amountPaid: 0,
      status: 'Pending'
    });

    const createdInvoice = await invoice.save();
    const populatedInvoice = await Invoice.findById(createdInvoice._id)
      .populate('patient', 'name mrn phone')
      .populate('createdBy', 'name');

    res.status(201).json(populatedInvoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private
const getInvoices = async (req, res) => {
  try {
    const { status, patientId, startDate, endDate } = req.query;
    const query = {};

    if (status) query.status = status;
    if (patientId) query.patient = patientId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const invoices = await Invoice.find(query)
      .populate('patient', 'name mrn phone')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Private
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('patient', 'name dateOfBirth gender mrn address phone')
      .populate('createdBy', 'name');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Process payment for invoice
// @route   POST /api/invoices/:id/payment
// @access  Receptionist, Admin
const processPayment = async (req, res) => {
  try {
    const { amount, paymentMethod, transactionRef, notes } = req.body;
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.status === 'Paid') {
      return res.status(400).json({ message: 'Invoice already fully paid' });
    }

    const remainingBalance = invoice.total - invoice.amountPaid;
    const paymentAmount = Math.min(amount, remainingBalance);

    // Add payment record
    invoice.payments.push({
      amount: paymentAmount,
      paymentMethod,
      transactionRef,
      notes,
      paidBy: req.user.id
    });

    invoice.amountPaid += paymentAmount;

    // Update status
    if (invoice.amountPaid >= invoice.total) {
      invoice.status = 'Paid';
    } else if (invoice.amountPaid > 0) {
      invoice.status = 'Partial';
    }

    const updatedInvoice = await invoice.save();
    const populated = await Invoice.findById(updatedInvoice._id)
      .populate('patient', 'name mrn')
      .populate('payments.paidBy', 'name');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get financial summary
// @route   GET /api/invoices/summary
// @access  Admin
const getFinancialSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const summary = await Invoice.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          totalAmount: { $sum: '$total' },
          totalPaid: { $sum: '$amountPaid' },
          count: { $sum: 1 }
        }
      }
    ]);

    const dailyRevenue = await Invoice.aggregate([
      { 
        $match: { 
          status: 'Paid',
          ...(startDate || endDate ? { createdAt: query.createdAt } : {})
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const paymentMethodBreakdown = await Invoice.aggregate([
      { $match: { status: 'Paid' } },
      { $unwind: '$payments' },
      {
        $group: {
          _id: '$payments.paymentMethod',
          totalAmount: { $sum: '$payments.amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      byStatus: summary,
      dailyRevenue,
      byPaymentMethod: paymentMethodBreakdown
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  processPayment,
  getFinancialSummary
};
