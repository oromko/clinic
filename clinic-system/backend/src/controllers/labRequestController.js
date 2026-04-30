const LabRequest = require('../models/LabRequest');
const LabTestCatalog = require('../models/LabTestCatalog');
const Patient = require('../models/Patient');
const User = require('../models/User');
const pdfService = require('../services/pdfService');

// @desc    Create a new lab request
// @route   POST /api/lab-requests
// @access  Doctor, Admin
const createLabRequest = async (req, res) => {
  try {
    const { patientId, tests, priority, clinicalNotes } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Generate Lab ID: LAB-YYYYMMDD-XXXX
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await LabRequest.countDocuments({ 
      createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } 
    });
    const sequence = String(count + 1).padStart(4, '0');
    const labId = `LAB-${datePart}-${sequence}`;

    const labRequest = new LabRequest({
      labId,
      patient: patientId,
      requestedBy: req.user.id,
      tests,
      priority: priority || 'routine',
      clinicalNotes,
      status: 'Requested'
    });

    const createdRequest = await labRequest.save();
    const populatedRequest = await LabRequest.findById(createdRequest._id)
      .populate('patient', 'name dateOfBirth gender')
      .populate('requestedBy', 'name specialization');

    res.status(201).json(populatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all lab requests (with filters)
// @route   GET /api/lab-requests
// @access  Doctor, LabTech, Admin
const getLabRequests = async (req, res) => {
  try {
    const { status, priority, patientId } = req.query;
    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (patientId) query.patient = patientId;

    // Role-based filtering
    if (req.user.role === 'LabTech') {
      query.$or = [
        { status: { $in: ['Requested', 'Sample Collected', 'Result Entered'] } },
        { assignedTo: req.user.id }
      ];
    } else if (req.user.role === 'Doctor') {
      query.requestedBy = req.user.id;
    }

    const requests = await LabRequest.find(query)
      .populate('patient', 'name dateOfBirth gender mrn')
      .populate('requestedBy', 'name specialization')
      .populate('assignedTo', 'name')
      .populate('verifiedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update lab request status (Workflow)
// @route   PUT /api/lab-requests/:id/status
// @access  LabTech, Doctor
const updateLabStatus = async (req, res) => {
  try {
    const { status, results, assignedTo } = req.body;
    const labRequest = await LabRequest.findById(req.params.id);

    if (!labRequest) {
      return res.status(404).json({ message: 'Lab request not found' });
    }

    // Workflow Validation
    const workflow = ['Requested', 'Sample Collected', 'Result Entered', 'Verified', 'Finalized'];
    const currentIndex = workflow.indexOf(labRequest.status);
    const nextIndex = workflow.indexOf(status);

    if (nextIndex !== -1 && nextIndex <= currentIndex) {
      return res.status(400).json({ message: 'Invalid status transition' });
    }

    labRequest.status = status;

    if (assignedTo) {
      labRequest.assignedTo = assignedTo;
    }

    if (results) {
      labRequest.results = results;
      
      // Auto-flag abnormal results
      labRequest.results = await Promise.all(labRequest.results.map(async (resultItem) => {
        const testCatalog = await LabTestCatalog.findOne({ testName: resultItem.testName });
        if (testCatalog && resultItem.value) {
          const val = parseFloat(resultItem.value);
          if (testCatalog.criticalLow && val < testCatalog.criticalLow) {
            resultItem.flag = 'CRITICAL_LOW';
          } else if (testCatalog.criticalHigh && val > testCatalog.criticalHigh) {
            resultItem.flag = 'CRITICAL_HIGH';
          } else if (testCatalog.referenceMin && val < testCatalog.referenceMin) {
            resultItem.flag = 'LOW';
          } else if (testCatalog.referenceMax && val > testCatalog.referenceMax) {
            resultItem.flag = 'HIGH';
          } else {
            resultItem.flag = 'NORMAL';
          }
        }
        return resultItem;
      }));
    }

    if (status === 'Verified' || status === 'Finalized') {
      labRequest.verifiedBy = req.user.id;
      labRequest.verifiedAt = new Date();
    }

    const updatedRequest = await labRequest.save();
    const populated = await LabRequest.findById(updatedRequest._id)
      .populate('patient', 'name')
      .populate('verifiedBy', 'name');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single lab request
// @route   GET /api/lab-requests/:id
// @access  Private
const getLabRequestById = async (req, res) => {
  try {
    const request = await LabRequest.findById(req.params.id)
      .populate('patient', 'name dateOfBirth gender mrn address phone')
      .populate('requestedBy', 'name specialization')
      .populate('assignedTo', 'name')
      .populate('verifiedBy', 'name');

    if (!request) {
      return res.status(404).json({ message: 'Lab request not found' });
    }
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download Lab Result as PDF with QR Code
// @route   GET /api/lab-requests/:id/pdf
// @access  Private (Doctor, LabTech, Admin)
const downloadLabResultPDF = async (req, res) => {
  try {
    const labRequest = await LabRequest.findById(req.params.id)
      .populate('patient')
      .populate('requestedBy')
      .populate('verifiedBy');

    if (!labRequest) {
      return res.status(404).json({ msg: 'Lab request not found' });
    }

    // Only allow finalized results to be printed
    if (labRequest.status !== 'Finalized') {
      return res.status(400).json({ msg: 'Only finalized results can be printed' });
    }

    const patient = labRequest.patient;
    const doctor = labRequest.verifiedBy || labRequest.requestedBy;

    // Format results for PDF
    const results = labRequest.results.map(r => ({
      testName: r.testName,
      result: r.result || r.value,
      unit: r.unit,
      referenceRange: r.referenceRange,
      flag: r.flag
    }));

    const pdfBuffer = await pdfService.generateLabResultPDF(labRequest, patient, doctor, results);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=LabResult_${labRequest.labId}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  createLabRequest,
  getLabRequests,
  updateLabStatus,
  getLabRequestById,
  downloadLabResultPDF
};
