const MedicalCertificate = require('../models/MedicalCertificate');
const pdfService = require('../services/pdfService');

// @desc    Create new medical certificate
// @route   POST /api/certificates
// @access  Private/Doctor
exports.createCertificate = async (req, res) => {
  try {
    const {
      patient,
      type,
      headerSection,
      patientInfoSection,
      vitalSignsSection,
      clinicalExaminationSection,
      laboratoryInvestigationSection,
      footerSection,
      diagnosis,
      recommendations,
      validFrom,
      validUntil,
    } = req.body;

    // Generate Certificate ID
    const count = await MedicalCertificate.countDocuments();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const certId = `CERT-${dateStr}-${String(count + 1).padStart(4, '0')}`;

    const certificate = await MedicalCertificate.create({
      certId,
      patient,
      issuedBy: req.user._id,
      type,
      headerSection,
      patientInfoSection,
      vitalSignsSection,
      clinicalExaminationSection,
      laboratoryInvestigationSection,
      footerSection,
      diagnosis,
      recommendations,
      validFrom: validFrom || new Date(),
      validUntil,
      status: 'Active',
      printCount: 0,
    });

    const populatedCert = await MedicalCertificate.findById(certificate._id)
      .populate('patient', 'firstName lastName mrn dateOfBirth')
      .populate('issuedBy', 'name specialization licenseNumber');

    res.status(201).json(populatedCert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all certificates with filters
// @route   GET /api/certificates
// @access  Private
exports.getCertificates = async (req, res) => {
  try {
    const { type, status, patientId } = req.query;
    let query = {};

    if (type) query.type = type;
    if (status) query.status = status;
    if (patientId) query.patient = patientId;

    const certificates = await MedicalCertificate.find(query)
      .populate('patient', 'firstName lastName mrn')
      .populate('issuedBy', 'name specialization')
      .sort({ createdAt: -1 });

    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get certificate by ID
// @route   GET /api/certificates/:id
// @access  Private
exports.getCertificateById = async (req, res) => {
  try {
    const certificate = await MedicalCertificate.findById(req.params.id)
      .populate('patient', 'firstName lastName mrn dateOfBirth gender address phone')
      .populate('issuedBy', 'name specialization licenseNumber email')
      .populate('diagnosis.code');

    if (certificate) {
      res.json(certificate);
    } else {
      res.status(404).json({ message: 'Certificate not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Revoke certificate
// @route   PUT /api/certificates/:id/revoke
// @access  Private/Doctor/Admin
exports.revokeCertificate = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const certificate = await MedicalCertificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    if (certificate.status === 'Revoked') {
      return res.status(400).json({ message: 'Certificate already revoked' });
    }

    certificate.status = 'Revoked';
    certificate.revokedAt = Date.now();
    certificate.revokedBy = req.user._id;
    certificate.revocationReason = reason;

    const updated = await certificate.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Increment print count
// @route   PUT /api/certificates/:id/print
// @access  Private
exports.incrementPrintCount = async (req, res) => {
  try {
    const certificate = await MedicalCertificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    certificate.printCount += 1;
    certificate.lastPrintedAt = Date.now();

    const updated = await certificate.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download certificate PDF
// @route   GET /api/certificates/:id/pdf
// @access  Private
exports.downloadCertificatePDF = async (req, res) => {
  try {
    const certificate = await MedicalCertificate.findById(req.params.id)
      .populate('patient', 'firstName lastName mrn dateOfBirth gender address phone')
      .populate('issuedBy', 'name specialization licenseNumber email')
      .populate('diagnosis.code');

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    if (certificate.status === 'Revoked') {
      return res.status(400).json({ message: 'Cannot print revoked certificate' });
    }

    // Increment print count
    certificate.printCount += 1;
    certificate.lastPrintedAt = Date.now();
    await certificate.save();

    const pdfBuffer = await pdfService.generateMedicalCertificatePDF(certificate);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Certificate_${certificate.certId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete certificate
// @route   DELETE /api/certificates/:id
// @access  Private/Admin
exports.deleteCertificate = async (req, res) => {
  try {
    const certificate = await MedicalCertificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    await certificate.deleteOne();
    res.json({ message: 'Certificate removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify certificate by ID (public endpoint for QR verification)
// @route   GET /api/certificates/verify/:certId
// @access  Public
exports.verifyCertificate = async (req, res) => {
  try {
    const certificate = await MedicalCertificate.findOne({ certId: req.params.certId })
      .populate('patient', 'firstName lastName')
      .populate('issuedBy', 'name specialization');

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    res.json({
      valid: certificate.status === 'Active',
      status: certificate.status,
      type: certificate.type,
      issuedDate: certificate.createdAt,
      validFrom: certificate.validFrom,
      validUntil: certificate.validUntil,
      patientName: `${certificate.patient?.firstName} ${certificate.patient?.lastName}`,
      doctorName: certificate.issuedBy?.name,
      revocationReason: certificate.revocationReason,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
