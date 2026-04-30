const Appointment = require('../models/Appointment');

// @desc    Get all appointments with filters
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res) => {
  try {
    const { status, doctorId, patientId, date } = req.query;
    let query = {};

    if (status) query.status = status;
    if (doctorId) query.doctor = doctorId;
    if (patientId) query.patient = patientId;
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName phone')
      .populate('doctor', 'name specialization')
      .sort({ date: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'firstName lastName mrn dateOfBirth phone email')
      .populate('doctor', 'name specialization email');

    if (appointment) {
      res.json(appointment);
    } else {
      res.status(404).json({ message: 'Appointment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
exports.createAppointment = async (req, res) => {
  try {
    const { patient, doctor, date, time, type, notes } = req.body;

    // Check for conflicting appointments
    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60000); // 30 min slot

    const conflict = await Appointment.findOne({
      doctor,
      date: { $gte: startDateTime, $lt: endDateTime },
      status: { $in: ['Scheduled', 'Confirmed'] }
    });

    if (conflict) {
      return res.status(400).json({ message: 'Doctor has a conflicting appointment at this time' });
    }

    const appointment = await Appointment.create({
      patient,
      doctor,
      date: startDateTime,
      type,
      notes,
      status: 'Scheduled',
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'name specialization');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    Object.assign(appointment, req.body);
    const updated = await appointment.save();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Confirm appointment
// @route   PUT /api/appointments/:id/confirm
// @access  Private
exports.confirmAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.status !== 'Scheduled') {
      return res.status(400).json({ message: 'Only scheduled appointments can be confirmed' });
    }

    appointment.status = 'Confirmed';
    const updated = await appointment.save();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
exports.cancelAppointment = async (req, res) => {
  try {
    const { reason } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (['Completed', 'Cancelled'].includes(appointment.status)) {
      return res.status(400).json({ message: 'Cannot cancel completed or cancelled appointment' });
    }

    appointment.status = 'Cancelled';
    appointment.cancellationReason = reason;
    const updated = await appointment.save();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Complete appointment
// @route   PUT /api/appointments/:id/complete
// @access  Private/Doctor
exports.completeAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.status !== 'Confirmed') {
      return res.status(400).json({ message: 'Only confirmed appointments can be completed' });
    }

    appointment.status = 'Completed';
    appointment.completedAt = Date.now();
    const updated = await appointment.save();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private/Admin
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    await appointment.deleteOne();
    res.json({ message: 'Appointment removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get doctor's schedule
// @route   GET /api/appointments/doctor/:doctorId/schedule
// @access  Private
exports.getDoctorSchedule = async (req, res) => {
  try {
    const { date } = req.query;
    const doctorId = req.params.doctorId;
    
    let query = { doctor: doctorId };
    
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName phone')
      .sort({ date: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
