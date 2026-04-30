const express = require('express');
const ICD11Code = require('../models/ICD11Code');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search, chapter, limit = 50 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (chapter) {
      query.chapter = chapter;
    }

    const codes = await ICD11Code.find(query).limit(parseInt(limit));
    res.json(codes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/chapters', async (req, res) => {
  try {
    const chapters = await ICD11Code.distinct('chapter');
    res.json(chapters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:code', async (req, res) => {
  try {
    const code = await ICD11Code.findOne({ code: req.params.code });
    if (!code) {
      return res.status(404).json({ message: 'Code not found' });
    }
    res.json(code);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
