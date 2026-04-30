const express = require('express');
const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  addPayment,
  updateInvoice,
  deleteInvoice,
  getFinancialSummary
} = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getInvoices)
  .post(protect, authorize('Receptionist', 'Admin', 'Doctor'), createInvoice);

router.get('/summary', protect, authorize('Admin', 'Doctor'), getFinancialSummary);

router.route('/:id')
  .get(protect, getInvoiceById)
  .put(protect, authorize('Receptionist', 'Admin'), updateInvoice)
  .delete(protect, authorize('Admin'), deleteInvoice);

router.post('/:id/payments', protect, authorize('Receptionist', 'Admin'), addPayment);

export default router;
