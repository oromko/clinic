const Invoice = require('../models/Invoice');

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Private
exports.createInvoice = async (req, res) => {
  try {
    const { patient, items, discountPercent = 0, taxPercent = 0 } = req.body;

    // Calculate totals
    let subtotal = 0;
    items.forEach(item => {
      subtotal += item.price * item.quantity;
    });

    const discountAmount = subtotal * (discountPercent / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (taxPercent / 100);
    const total = taxableAmount + taxAmount;

    // Generate Invoice ID
    const count = await Invoice.countDocuments();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const invoiceId = `INV-${dateStr}-${String(count + 1).padStart(4, '0')}`;

    const invoice = await Invoice.create({
      invoiceId,
      patient,
      issuedBy: req.user._id,
      items,
      subtotal,
      discountPercent,
      discountAmount,
      taxPercent,
      taxAmount,
      total,
      amountPaid: 0,
      balanceDue: total,
      status: total === 0 ? 'Paid' : 'Pending',
    });

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('patient', 'firstName lastName mrn')
      .populate('issuedBy', 'name');

    res.status(201).json(populatedInvoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all invoices with filters
// @route   GET /api/invoices
// @access  Private
exports.getInvoices = async (req, res) => {
  try {
    const { status, patientId, dateFrom, dateTo } = req.query;
    let query = {};

    if (status) query.status = status;
    if (patientId) query.patient = patientId;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const invoices = await Invoice.find(query)
      .populate('patient', 'firstName lastName mrn')
      .populate('issuedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('patient', 'firstName lastName mrn dateOfBirth address phone')
      .populate('issuedBy', 'name')
      .populate('payments.paymentBy', 'name');

    if (invoice) {
      res.json(invoice);
    } else {
      res.status(404).json({ message: 'Invoice not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add payment to invoice
// @route   POST /api/invoices/:id/payments
// @access  Private
exports.addPayment = async (req, res) => {
  try {
    const { amount, paymentMethod, paymentBy, notes } = req.body;

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Payment amount must be positive' });
    }

    if (amount > invoice.balanceDue) {
      return res.status(400).json({ message: 'Payment amount exceeds balance due' });
    }

    invoice.payments.push({
      amount,
      paymentMethod,
      paymentBy: paymentBy || req.user._id,
      notes,
      paidAt: new Date(),
    });

    invoice.amountPaid += amount;
    invoice.balanceDue -= amount;

    if (invoice.balanceDue <= 0) {
      invoice.status = 'Paid';
    } else if (invoice.amountPaid > 0) {
      invoice.status = 'Partial';
    }

    const updated = await invoice.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private
exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.status === 'Paid') {
      return res.status(400).json({ message: 'Cannot modify paid invoice' });
    }

    Object.assign(invoice, req.body);
    const updated = await invoice.save();
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private/Admin
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.status === 'Paid' || invoice.status === 'Partial') {
      return res.status(400).json({ message: 'Cannot delete invoice with payments' });
    }

    await invoice.deleteOne();
    res.json({ message: 'Invoice removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get financial summary
// @route   GET /api/invoices/summary
// @access  Private/Admin
exports.getFinancialSummary = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    let query = {};

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const summary = await Invoice.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' },
          totalPaid: { $sum: '$amountPaid' },
          totalBalance: { $sum: '$balanceDue' },
        },
      },
    ]);

    const overallStats = await Invoice.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalRevenue: { $sum: '$amountPaid' },
          totalOutstanding: { $sum: '$balanceDue' },
        },
      },
    ]);

    res.json({
      byStatus: summary,
      overall: overallStats[0] || { totalInvoices: 0, totalRevenue: 0, totalOutstanding: 0 },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
