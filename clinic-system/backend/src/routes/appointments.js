const express = require('express');
const {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  confirmAppointment,
  cancelAppointment,
  completeAppointment,
  deleteAppointment,
  getDoctorSchedule
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAppointments)
  .post(authorize('Admin', 'Doctor', 'Receptionist'), createAppointment);

router.get('/doctor/:doctorId/schedule', getDoctorSchedule);

router.route('/:id')
  .get(getAppointmentById)
  .put(authorize('Admin', 'Doctor', 'Receptionist'), updateAppointment)
  .delete(authorize('Admin', 'Doctor'), deleteAppointment);

router.put('/:id/confirm', authorize('Admin', 'Doctor', 'Receptionist'), confirmAppointment);
router.put('/:id/cancel', authorize('Admin', 'Doctor', 'Receptionist'), cancelAppointment);
router.put('/:id/complete', authorize('Doctor', 'Admin'), completeAppointment);

export default router;
