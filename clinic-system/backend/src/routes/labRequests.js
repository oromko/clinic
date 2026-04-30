const express = require('express');
const {
  createLabRequest,
  getLabRequests,
  getLabRequestById,
  collectSample,
  enterResults,
  verifyResults,
  finalizeResults,
  downloadLabResultPDF,
  deleteLabRequest
} = require('../controllers/labRequestController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getLabRequests)
  .post(protect, authorize('Doctor', 'Admin'), createLabRequest);

router.route('/:id')
  .get(protect, getLabRequestById)
  .delete(protect, authorize('Admin'), deleteLabRequest);

router.put('/:id/collect', protect, authorize('LabTech', 'Doctor'), collectSample);
router.put('/:id/results', protect, authorize('LabTech', 'Doctor'), enterResults);
router.put('/:id/verify', protect, authorize('Doctor', 'Admin'), verifyResults);
router.put('/:id/finalize', protect, authorize('Doctor', 'Admin'), finalizeResults);

// PDF Generation route
router.get('/:id/pdf', protect, downloadLabResultPDF);

export default router;
