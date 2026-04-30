const express = require('express');
const {
  createCertificate,
  getCertificates,
  getCertificateById,
  revokeCertificate,
  incrementPrintCount,
  downloadCertificatePDF,
  verifyCertificate,
  deleteCertificate
} = require('../controllers/certificateController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getCertificates)
  .post(protect, authorize('Doctor', 'Admin'), createCertificate);

// Public verification endpoint for QR codes
router.get('/verify/:certId', verifyCertificate);

router.route('/:id')
  .get(protect, getCertificateById)
  .delete(protect, authorize('Admin'), deleteCertificate);

router.get('/:id/pdf', protect, downloadCertificatePDF);
router.put('/:id/print', protect, incrementPrintCount);
router.put('/:id/revoke', protect, authorize('Doctor', 'Admin'), revokeCertificate);

export default router;
