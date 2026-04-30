const MedicalCertificate = require('../models/MedicalCertificate');
const Patient = require('../models/Patient');
const User = require('../models/User');
const QRCode = require('qrcode');
const pdfService = require('../services/pdfService');

// @desc    Create a new medical certificate
// @route   POST /api/certificates
// @access  Doctor, Admin
const createCertificate = async (req, res) => {
  try {
    const {
      patientId,
      type,
      patientInfo,
      vitalSigns,
      clinicalExamination,
      laboratoryInvestigations,
      finalResult,
      declaration,
      validityDays
    } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Generate Certificate ID: CERT-YYYYMMDD-XXXX
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await MedicalCertificate.countDocuments({ 
      createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } 
    });
    const sequence = String(count + 1).padStart(4, '0');
    const certificateId = `CERT-${datePart}-${sequence}`;

    // Generate QR Code data
    const qrData = JSON.stringify({
      certificateId,
      type,
      issueDate: new Date(),
      doctorId: req.user.id,
      verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${certificateId}`
    });

    const certificate = new MedicalCertificate({
      certificateId,
      patient: patientId,
      issuedBy: req.user.id,
      type,
      patientInfo: patientInfo || {
        name: patient.firstName + ' ' + patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        mrn: patient.mrn,
        address: patient.address,
        phone: patient.phone
      },
      vitalSigns: vitalSigns || {},
      clinicalExamination: clinicalExamination || '',
      laboratoryInvestigations: laboratoryInvestigations || [],
      finalResult: finalResult || '',
      declaration: declaration || '',
      validityDays: validityDays || 30,
      qrCodeData: qrData
    });

    const createdCert = await certificate.save();
    const populatedCert = await MedicalCertificate.findById(createdCert._id)
      .populate('patient', 'name dateOfBirth gender mrn')
      .populate('issuedBy', 'name specialization licenseNumber');

    res.status(201).json(populatedCert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all certificates
// @route   GET /api/certificates
// @access  Private
const getCertificates = async (req, res) => {
  try {
    const { type, status, patientId } = req.query;
    const query = {};

    if (type) query.type = type;
    if (status) query.status = status;
    if (patientId) query.patient = patientId;

    if (req.user.role === 'Doctor') {
      query.issuedBy = req.user.id;
    }

    const certificates = await MedicalCertificate.find(query)
      .populate('patient', 'name dateOfBirth gender mrn')
      .populate('issuedBy', 'name specialization')
      .sort({ createdAt: -1 });

    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single certificate by ID
// @route   GET /api/certificates/:id
// @access  Public (for verification)
const getCertificateById = async (req, res) => {
  try {
    const certificate = await MedicalCertificate.findOne({ 
      $or: [
        { _id: req.params.id },
        { certificateId: req.params.id }
      ]
    })
      .populate('patient', 'name dateOfBirth gender mrn address phone')
      .populate('issuedBy', 'name specialization licenseNumber');

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    // Increment print count
    certificate.printCount += 1;
    await certificate.save();

    res.json(certificate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Revoke a certificate
// @route   PUT /api/certificates/:id/revoke
// @access  Admin, Doctor (who issued)
const revokeCertificate = async (req, res) => {
  try {
    const { reason } = req.body;
    const certificate = await MedicalCertificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    if (req.user.role !== 'Admin' && certificate.issuedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to revoke this certificate' });
    }

    certificate.status = 'Revoked';
    certificate.revocationReason = reason;
    certificate.revokedAt = new Date();
    certificate.revokedBy = req.user.id;

    const updatedCert = await certificate.save();
    res.json(updatedCert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify certificate via QR code
// @route   GET /api/certificates/verify/:certificateId
// @access  Public
const verifyCertificate = async (req, res) => {
  try {
    const certificate = await MedicalCertificate.findOne({ 
      certificateId: req.params.certificateId 
    })
      .populate('patient', 'name')
      .populate('issuedBy', 'name specialization');

    if (!certificate) {
      return res.status(404).json({ 
        valid: false, 
        message: 'Certificate not found' 
      });
    }

    const isValid = certificate.status === 'Active';
    res.json({
      valid: isValid,
      certificate: {
        certificateId: certificate.certificateId,
        type: certificate.type,
        issueDate: certificate.issueDate,
        expiryDate: certificate.expiryDate,
        status: certificate.status,
        patientName: certificate.patient?.name,
        doctorName: certificate.issuedBy?.name,
        specialization: certificate.issuedBy?.specialization
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download Medical Certificate as PDF with QR Code
// @route   GET /api/certificates/:id/pdf
// @access  Private (Doctor, Admin, Patient)
const downloadCertificatePDF = async (req, res) => {
  try {
    const certificate = await MedicalCertificate.findById(req.params.id)
      .populate('patient')
      .populate('issuedBy');

    if (!certificate) {
      return res.status(404).json({ msg: 'Certificate not found' });
    }

    const patient = certificate.patient;
    const doctor = certificate.issuedBy;

    // Prepare data for PDF
    const certData = {
      certificateId: certificate.certificateId,
      issueDate: certificate.issueDate.toLocaleDateString(),
      vitals: certificate.vitalSigns,
      examination: certificate.clinicalExamination,
      diagnosis: certificate.finalResult,
      remarks: certificate.declaration
    };

    const labResults = certificate.laboratoryInvestigations || [];

    const pdfBuffer = await pdfService.generateMedicalCertificate(certData, patient, doctor, labResults);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Certificate_${certificate.certificateId}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  createCertificate,
  getCertificates,
  getCertificateById,
  revokeCertificate,
  verifyCertificate,
  downloadCertificatePDF
};
