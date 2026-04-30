const HMISReport = require('../models/HMISReport');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const LabRequest = require('../models/LabRequest');
const Invoice = require('../models/Invoice');

// @desc    Generate daily summary report
// @route   GET /api/reports/hmis/daily
// @access  Private/Admin
exports.getDailySummary = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // Patient count
    const patientCount = await Patient.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    // Appointment stats
    const appointments = await Appointment.aggregate([
      { 
        $match: { 
          date: { $gte: startOfDay, $lte: endOfDay } 
        } 
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Revenue
    const revenue = await Invoice.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startOfDay, $lte: endOfDay } 
        } 
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amountPaid' },
          totalInvoices: { $sum: 1 }
        }
      }
    ]);

    // Lab tests
    const labTests = await LabRequest.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    res.json({
      date: targetDate,
      newPatients: patientCount,
      appointments: appointments.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      revenue: revenue[0] || { totalRevenue: 0, totalInvoices: 0 },
      labTests,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate monthly financial report
// @route   GET /api/reports/hmis/monthly
// @access  Private/Admin
exports.getMonthlyFinancial = async (req, res) => {
  try {
    const { year, month } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    const targetMonth = month ? parseInt(month) - 1 : new Date().getMonth();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

    const financialData = await Invoice.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate, $lte: endDate } 
        } 
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' },
          totalPaid: { $sum: '$amountPaid' },
          totalBalance: { $sum: '$balanceDue' }
        }
      }
    ]);

    const paymentMethods = await Invoice.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['Paid', 'Partial'] }
        } 
      },
      { $unwind: '$payments' },
      {
        $group: {
          _id: '$payments.paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$payments.amount' }
        }
      }
    ]);

    res.json({
      period: { year: targetYear, month: targetMonth + 1 },
      byStatus: financialData,
      byPaymentMethod: paymentMethods,
      summary: {
        totalInvoices: financialData.reduce((acc, curr) => acc + curr.count, 0),
        totalRevenue: financialData.reduce((acc, curr) => acc + curr.totalPaid, 0),
        outstanding: financialData.reduce((acc, curr) => acc + curr.totalBalance, 0),
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get disease surveillance (top diagnoses)
// @route   GET /api/reports/hmis/disease-surveillance
// @access  Private/Admin
exports.getDiseaseSurveillance = async (req, res) => {
  try {
    const { dateFrom, dateTo, limit = 10 } = req.query;
    let query = {};

    if (dateFrom || dateTo) {
      query.visitDate = {};
      if (dateFrom) query.visitDate.$gte = new Date(dateFrom);
      if (dateTo) query.visitDate.$lte = new Date(dateTo);
    }

    const topDiagnoses = await MedicalRecord.aggregate([
      { $match: query },
      { $unwind: '$diagnoses' },
      {
        $group: {
          _id: '$diagnoses.code',
          count: { $sum: 1 },
          description: { $first: '$diagnoses.description' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json(topDiagnoses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get demographic report
// @route   GET /api/reports/hmis/demographics
// @access  Private/Admin
exports.getDemographics = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    let query = {};

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    // Gender distribution
    const genderDist = await Patient.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      }
    ]);

    // Age groups
    const ageGroups = await Patient.aggregate([
      { $match: query },
      {
        $addFields: {
          age: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), '$dateOfBirth'] },
                31536000000
              ]
            }
          }
        }
      },
      {
        $bucket: {
          groupBy: '$age',
          boundaries: [0, 1, 5, 13, 18, 45, 60, 100],
          default: 'Unknown',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    res.json({
      genderDistribution: genderDist,
      ageGroups: ageGroups,
      totalPatients: await Patient.countDocuments(query)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export HMIS report
// @route   POST /api/reports/hmis/export
// @access  Private/Admin
exports.exportReport = async (req, res) => {
  try {
    const { type, dateFrom, dateTo, format } = req.body;

    const reportData = {
      type,
      dateFrom,
      dateTo,
      generatedAt: new Date(),
      generatedBy: req.user._id,
      data: {}
    };

    // Fetch data based on type
    if (type === 'daily') {
      // ... fetch daily data
    } else if (type === 'monthly') {
      // ... fetch monthly data
    }

    const report = await HMISReport.create(reportData);

    res.json({
      message: 'Report generated successfully',
      reportId: report._id,
      // In production, return download URL or file buffer
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
