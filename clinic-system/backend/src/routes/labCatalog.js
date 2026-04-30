const express = require('express');
const LabTestCatalog = require('../models/LabTestCatalog');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.testName = { $regex: search, $options: 'i' };
    }

    const tests = await LabTestCatalog.find(query).sort({ category: 1, testName: 1 });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const test = await LabTestCatalog.findOne({ testId: req.params.id });
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    res.json(test);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, authorize('Admin', 'LabTech'), async (req, res) => {
  try {
    const test = await LabTestCatalog.create(req.body);
    res.status(201).json(test);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, authorize('Admin', 'LabTech'), async (req, res) => {
  try {
    const test = await LabTestCatalog.findOneAndUpdate(
      { testId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    res.json(test);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const test = await LabTestCatalog.findOneAndDelete({ testId: req.params.id });
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    res.json({ message: 'Test deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
