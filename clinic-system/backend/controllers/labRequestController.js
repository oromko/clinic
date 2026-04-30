const LabRequest = require('../models/LabRequest');
const LabTestCatalog = require('../models/LabTestCatalog');
const pdfService = require('../services/pdfService');

// @desc    Create new lab request
// @route   POST /api/lab-requests
// @access  Private/Doctor
exports.createLabRequest = async (req, res) => {
  try {
    const { patient, tests, priority, clinicalNotes } = req.body;

    // Generate Lab ID
    const count = await LabRequest.countDocuments();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const labId = `LAB-${dateStr}-${String(count + 1).padStart(4, '0')}`;

    const labRequest = await LabRequest.create({
      labId,
      patient,
      requestedBy: req.user._id,
      tests,
      priority: priority || 'routine',
      clinicalNotes,
      status: 'Requested'
    });

    const populatedRequest = await LabRequest.findById(labRequest._id)
      .populate('tests.testId')
      .populate('patient', 'firstName lastName mrn');

    res.status(201).json(populatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all lab requests with filters
// @route   GET /api/lab-requests
// @access  Private
exports.getLabRequests = async (req, res) => {
  try {
    const { status, priority, patientId } = req.query;
    let query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (patientId) query.patient = patientId;

    const requests = await LabRequest.find(query)
      .populate('patient', 'firstName lastName mrn')
      .populate('requestedBy', 'name specialization')
      .populate('tests.testId')
      .populate('verifiedBy', 'name')
      .populate('finalizedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get lab request by ID
// @route   GET /api/lab-requests/:id
// @access  Private
exports.getLabRequestById = async (req, res) => {
  try {
    const request = await LabRequest.findById(req.params.id)
      .populate('patient', 'firstName lastName mrn dateOfBirth gender')
      .populate('requestedBy', 'name specialization')
      .populate('tests.testId')
      .populate('verifiedBy', 'name')
      .populate('finalizedBy', 'name');

    if (request) {
      res.json(request);
    } else {
      res.status(404).json({ message: 'Lab request not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update lab request status (Sample Collected)
// @route   PUT /api/lab-requests/:id/collect
// @access  Private/LabTech
exports.collectSample = async (req, res) => {
  try {
    const request = await LabRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Lab request not found' });
    }

    if (request.status !== 'Requested') {
      return res.status(400).json({ message: 'Invalid status transition' });
    }

    request.status = 'Sample Collected';
    request.sampleCollectedAt = Date.now();
    
    const updated = await request.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Enter lab results
// @route   PUT /api/lab-requests/:id/results
// @access  Private/LabTech
exports.enterResults = async (req, res) => {
  try {
    const { testId, resultValue, units, notes } = req.body;
    
    const request = await LabRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Lab request not found' });
    }

    if (!['Sample Collected', 'Result Entered'].includes(request.status)) {
      return res.status(400).json({ message: 'Invalid status for entering results' });
    }

    // Find the test in the request
    const testEntry = request.tests.id(testId);
    if (!testEntry) {
      return res.status(404).json({ message: 'Test not found in request' });
    }

    // Get reference ranges from catalog
    const testCatalog = await LabTestCatalog.findById(testEntry.testId);
    
    testEntry.resultValue = resultValue;
    testEntry.units = units || testCatalog?.units;
    testEntry.notes = notes;
    testEntry.resultEnteredAt = Date.now();
    testEntry.enteredBy = req.user._id;

    // Auto-flag abnormal results
    const numericResult = parseFloat(resultValue);
    if (!isNaN(numericResult) && testCatalog) {
      if (testCatalog.criticalLow && numericResult <= testCatalog.criticalLow) {
        testEntry.abnormalFlag = 'CRITICAL_LOW';
      } else if (testCatalog.criticalHigh && numericResult >= testCatalog.criticalHigh) {
        testEntry.abnormalFlag = 'CRITICAL_HIGH';
      } else if (testCatalog.referenceRangeMin && numericResult < testCatalog.referenceRangeMin) {
        testEntry.abnormalFlag = 'LOW';
      } else if (testCatalog.referenceRangeMax && numericResult > testCatalog.referenceRangeMax) {
        testEntry.abnormalFlag = 'HIGH';
      } else {
        testEntry.abnormalFlag = 'NORMAL';
      }
    }

    request.status = 'Result Entered';
    const updated = await request.save();
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify lab results
// @route   PUT /api/lab-requests/:id/verify
// @access  Private/Doctor
exports.verifyResults = async (req, res) => {
  try {
    const request = await LabRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Lab request not found' });
    }

    if (request.status !== 'Result Entered') {
      return res.status(400).json({ message: 'Results must be entered before verification' });
    }

    request.status = 'Verified';
    request.verifiedBy = req.user._id;
    request.verifiedAt = Date.now();
    
    const updated = await request.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Finalize lab results
// @route   PUT /api/lab-requests/:id/finalize
// @access  Private/Doctor
exports.finalizeResults = async (req, res) => {
  try {
    const request = await LabRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Lab request not found' });
    }

    if (request.status !== 'Verified') {
      return res.status(400).json({ message: 'Results must be verified before finalization' });
    }

    request.status = 'Finalized';
    request.finalizedBy = req.user._id;
    request.finalizedAt = Date.now();
    
    const updated = await request.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download lab result PDF
// @route   GET /api/lab-requests/:id/pdf
// @access  Private
exports.downloadLabResultPDF = async (req, res) => {
  try {
    const request = await LabRequest.findById(req.params.id)
      .populate('patient', 'firstName lastName mrn dateOfBirth gender')
      .populate('requestedBy', 'name specialization')
      .populate('tests.testId')
      .populate('verifiedBy', 'name')
      .populate('finalizedBy', 'name');

    if (!request) {
      return res.status(404).json({ message: 'Lab request not found' });
    }

    if (request.status !== 'Finalized') {
      return res.status(400).json({ message: 'Only finalized results can be printed' });
    }

    const pdfBuffer = await pdfService.generateLabResultPDF(request);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=LabResult_${request.labId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete lab request
// @route   DELETE /api/lab-requests/:id
// @access  Private/Admin
exports.deleteLabRequest = async (req, res) => {
  try {
    const request = await LabRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Lab request not found' });
    }

    if (request.status === 'Finalized') {
      return res.status(400).json({ message: 'Cannot delete finalized lab request' });
    }

    await request.deleteOne();
    res.json({ message: 'Lab request removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
