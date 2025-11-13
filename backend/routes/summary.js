const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchalluser");
const Summary = require("../models/Summary");
const User = require("../models/User");

// Add summary
router.post("/add", fetchuser, async (req, res) => {
  try {
    const { summaryText, wordLimit, language } = req.body;

    const wordCount = summaryText ? summaryText.split(/\s+/).filter(Boolean).length : 0;
    const needsSubscription = wordCount >= 1000 || (language && language.toLowerCase() !== 'hindi' && language.toLowerCase() !== 'english');

    if (needsSubscription) {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).send("User not found");
      }

      if (user.isSubscribed) {
        const now = new Date();
        if (user.subscriptionExpiresAt < now) {
          // Subscription has expired
          user.isSubscribed = false;
          await user.save();
          return res.status(402).json({ error: "Subscription expired. Please pay to renew." });
        }
      } else {
        return res.status(402).json({ error: "A subscription is required for summaries over 1000 words or for languages other than English and Hindi." });
      }
    }

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

