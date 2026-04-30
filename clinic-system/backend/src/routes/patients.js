const express = require('express');
const { getPatients, getPatientById, createPatient, updatePatient, deletePatient, getPatientRecords, getPatientLabRequests } = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getPatients)
  .post(authorize('Admin', 'Doctor', 'Receptionist'), createPatient);

router.route('/:id')
  .get(getPatientById)
  .put(authorize('Admin', 'Doctor', 'Receptionist'), updatePatient)
  .delete(authorize('Admin'), deletePatient);

router.get('/:id/records', getPatientRecords);
router.get('/:id/lab-requests', getPatientLabRequests);

export default router;
