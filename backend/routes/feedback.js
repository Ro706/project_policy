const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchalluser');
const Feedback = require('../models/Feedback');
const { body, validationResult } = require('express-validator');

// Route to submit feedback
router.post(
  '/submit',
  fetchuser,
  [
    body('experience', 'Experience is required').not().isEmpty(),
    body('feedback', 'Feedback is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { experience, feedback, suggestion } = req.body;

      const newFeedback = new Feedback({
        user: req.user.id,
        experience,
        feedback,
        suggestion,
      });

      const savedFeedback = await newFeedback.save();
      res.json(savedFeedback);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
