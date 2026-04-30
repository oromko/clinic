const express = require('express');
const {
  getDailySummary,
  getMonthlyFinancial,
  getDiseaseSurveillance,
  getDemographics,
  exportReport
} = require('../controllers/hmisReportController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/daily', protect, authorize('Admin', 'Doctor'), getDailySummary);
router.get('/monthly', protect, authorize('Admin', 'Doctor'), getMonthlyFinancial);
router.get('/disease-surveillance', protect, authorize('Admin', 'Doctor'), getDiseaseSurveillance);
router.get('/demographics', protect, authorize('Admin', 'Doctor'), getDemographics);
router.post('/export', protect, authorize('Admin'), exportReport);

export default router;
