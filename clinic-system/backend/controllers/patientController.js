const Patient = require('../models/Patient');

// @desc    Get all patients with search/filter
// @route   GET /api/patients
// @access  Private
exports.getPatients = async (req, res) => {
  try {
    const { search, gender, ageRange } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { mrn: { $regex: search, $options: 'i' } },
      ];
    }

    if (gender) {
      query.gender = gender;
    }

    const patients = await Patient.find(query).sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get patient by ID
// @route   GET /api/patients/:id
// @access  Private
exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    
    if (patient) {
      res.json(patient);
    } else {
      res.status(404).json({ message: 'Patient not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new patient
// @route   POST /api/patients
// @access  Private
exports.createPatient = async (req, res) => {
  try {
    const patientData = req.body;
    
    // Generate MRN if not provided
    if (!patientData.mrn) {
      const count = await Patient.countDocuments();
      patientData.mrn = `MRN-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    }

    const patient = await Patient.create(patientData);
    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private
exports.updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (patient) {
      Object.assign(patient, req.body);
      const updatedPatient = await patient.save();
      res.json(updatedPatient);
    } else {
      res.status(404).json({ message: 'Patient not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private/Admin
exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (patient) {
      await patient.deleteOne();
      res.json({ message: 'Patient removed' });
    } else {
      res.status(404).json({ message: 'Patient not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get patient medical records
// @route   GET /api/patients/:id/records
// @access  Private
exports.getPatientRecords = async (req, res) => {
  try {
    const MedicalRecord = require('../models/MedicalRecord');
    const records = await MedicalRecord.find({ patient: req.params.id })
      .populate('doctor', 'name specialization')
      .sort({ visitDate: -1 });
    
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get patient lab requests
// @route   GET /api/patients/:id/lab-requests
// @access  Private
exports.getPatientLabRequests = async (req, res) => {
  try {
    const LabRequest = require('../models/LabRequest');
    const requests = await LabRequest.find({ patient: req.params.id })
      .populate('tests.testId')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
