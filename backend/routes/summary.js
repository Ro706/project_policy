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
router.get("/getall", fetchuser, async (req, res) => {
  const summaries = await Summary.find({ user: req.user.id });
  res.json(summaries);
});

// Update summary
router.put("/update/:id", fetchuser, async (req, res) => {
  try {
    const { summaryText } = req.body;
    const summary = await Summary.findById(req.params.id);

    if (!summary) {
      return res.status(404).json({ error: "Summary not found" });
    }

    if (summary.user.toString() !== req.user.id) {
      return res.status(401).json({ error: "Not authorized" });
    }

    summary.summaryText = summaryText;
    await summary.save();

    res.json({ success: true, summary });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// Delete summary
router.delete("/delete/:id", fetchuser, async (req, res) => {
  try {
    const summary = await Summary.findById(req.params.id);

    if (!summary) {
      return res.status(404).json({ error: "Summary not found" });
    }

    if (summary.user.toString() !== req.user.id) {
      return res.status(401).json({ error: "Not authorized" });
    }

    await Summary.deleteOne({_id: req.params.id});

    res.json({ success: true, message: "Summary deleted" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;

