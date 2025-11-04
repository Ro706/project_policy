const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchalluser");
const Summary = require("../models/Summary");

// Add summary
router.post("/add", fetchuser, async (req, res) => {
  try {
    const { summaryText, wordLimit, language } = req.body;
    const newSummary = new Summary({
      user: req.user.id,
      summaryText,
      wordLimit,
      language,
    });
    await newSummary.save();
    res.json({ success: true, summary: newSummary });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// Get all summaries of logged-in user
// routes/summary.js
router.get("/getall", fetchuser, async (req, res) => {
  const summaries = await Summary.find({ user: req.user.id });
  res.json(summaries);
});


module.exports = router;
