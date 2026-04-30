const HMISReport = require('../models/HMISReport');
const Patient = require('../models/Patient');
const Invoice = require('../models/Invoice');
const MedicalRecord = require('../models/MedicalRecord');
const LabRequest = require('../models/LabRequest');

// @desc    Generate daily HMIS report
// @route   POST /api/reports/hmis/daily
// @access  Admin
const generateDailyReport = async (req, res) => {
  try {
    const { date } = req.body;
    const reportDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(reportDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(reportDate.setHours(23, 59, 59, 999));

    // Patient statistics
    const totalPatients = await Patient.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const patientsByGender = await Patient.aggregate([
      { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay } } },
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);

    const patientsByAgeGroup = await Patient.aggregate([
      { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay } } },
      {
        $addFields: {
          age: {
            $floor: { $divide: [{ $subtract: [new Date(), '$dateOfBirth'] }, 31536000000] }
          }
        }
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ['$age', 5] }, then: '0-4 years' },
                { case: { $lt: ['$age', 15] }, then: '5-14 years' },
                { case: { $lt: ['$age', 25] }, then: '15-24 years' },
                { case: { $lt: ['$age', 45] }, then: '25-44 years' },
                { case: { $lt: ['$age', 60] }, then: '45-59 years' }
              ],
              default: '60+ years'
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Revenue statistics
    const revenueData = await Invoice.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          status: { $in: ['Paid', 'Partial'] }
        } 
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amountPaid' },
          totalInvoices: { $sum: 1 },
          pendingAmount: { $sum: { $subtract: ['$total', '$amountPaid'] } }
        }
      }
    ]);

    // Laboratory statistics
    const labStats = await LabRequest.aggregate([
      { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top diagnoses
    const topDiagnoses = await MedicalRecord.aggregate([
      { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay } } },
      { $unwind: '$diagnoses' },
      {
        $group: {
          _id: '$diagnoses.code',
          description: { $first: '$diagnoses.description' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const report = new HMISReport({
      reportType: 'Daily',
      reportDate: startOfDay,
      generatedBy: req.user.id,
      data: {
        patientStatistics: {
          total: totalPatients,
          byGender: patientsByGender,
          byAgeGroup: patientsByAgeGroup
        },
        financialStatistics: {
          totalRevenue: revenueData[0]?.totalRevenue || 0,
          totalInvoices: revenueData[0]?.totalInvoices || 0,
          pendingAmount: revenueData[0]?.pendingAmount || 0
        },
        laboratoryStatistics: labStats,
        topDiagnoses
      }
    });

    const savedReport = await report.save();
    res.status(201).json(savedReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate monthly HMIS report
// @route   POST /api/reports/hmis/monthly
// @access  Admin
const generateMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.body; // month is 0-indexed
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    // Patient statistics
    const totalPatients = await Patient.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const patientsByGender = await Patient.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);

    // Daily breakdown for the month
    const dailyPatients = await Patient.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Revenue statistics
    const revenueData = await Invoice.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['Paid', 'Partial'] }
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

    const dailyRevenue = await Invoice.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate, $lte: endDate },
          status: 'Paid'
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Disease surveillance - Top 10 diagnoses
    const diseaseSurveillance = await MedicalRecord.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $unwind: '$diagnoses' },
      {
        $lookup: {
          from: 'icd11codes',
          localField: 'diagnoses.code',
          foreignField: 'code',
          as: 'icdInfo'
        }
      },
      { $unwind: { path: '$icdInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$diagnoses.code',
          description: { $first: { $ifNull: ['$icdInfo.description', '$diagnoses.description'] } },
          chapter: { $first: '$icdInfo.chapter' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // RMNCH indicators
    const rmnchStats = await MedicalRecord.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate, $lte: endDate },
          rmnchServices: { $exists: true, $ne: [] }
        } 
      },
      { $unwind: '$rmnchServices' },
      {
        $group: {
          _id: '$rmnchServices.serviceType',
          count: { $sum: 1 }
        }
      }
    ]);

    const report = new HMISReport({
      reportType: 'Monthly',
      reportDate: startDate,
      generatedBy: req.user.id,
      data: {
        period: { start: startDate, end: endDate },
        patientStatistics: {
          total: totalPatients,
          byGender: patientsByGender,
          daily: dailyPatients
        },
        financialStatistics: {
          totalRevenue: revenueData[0]?.totalRevenue || 0,
          totalInvoices: revenueData[0]?.totalInvoices || 0,
          dailyRevenue
        },
        diseaseSurveillance: diseaseSurveillance,
        rmnchIndicators: rmnchStats
      }
    });

    const savedReport = await report.save();
    res.status(201).json(savedReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all HMIS reports
// @route   GET /api/reports/hmis
// @access  Admin
const getHMISReports = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.query;
    const query = {};

    if (reportType) query.reportType = reportType;
    if (startDate || endDate) {
      query.reportDate = {};
      if (startDate) query.reportDate.$gte = new Date(startDate);
      if (endDate) query.reportDate.$lte = new Date(endDate);
    }

    const reports = await HMISReport.find(query)
      .populate('generatedBy', 'name')
      .sort({ reportDate: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export HMIS report to CSV
// @route   GET /api/reports/hmis/:id/export
// @access  Admin
const exportHMISReport = async (req, res) => {
  try {
    const report = await HMISReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Simple CSV generation (can be enhanced with a library)
    let csv = 'Metric,Value\n';
    csv += `Report Type,${report.reportType}\n`;
    csv += `Report Date,${report.reportDate}\n`;
    
    if (report.data.patientStatistics?.total) {
      csv += `Total Patients,${report.data.patientStatistics.total}\n`;
    }
    if (report.data.financialStatistics?.totalRevenue !== undefined) {
      csv += `Total Revenue,${report.data.financialStatistics.totalRevenue}\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=hmis-report-${report._id}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateDailyReport,
  generateMonthlyReport,
  getHMISReports,
  exportHMISReport
};
