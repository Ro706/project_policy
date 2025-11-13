const express = require('express');
const router = express.Router();
const fetchalluser = require('../middleware/fetchalluser');
const ChatSession = require('../models/ChatSession');

// ================= GEMINI SETUP =================
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to call real Gemini model
const getGeminiResponse = async (userQuery, context) => {
  if (!context || context.trim() === "") {
    return "No policy document found yet. Please upload a document first.";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });

    const prompt = `
You are an expert chatbot.You are made to help User to understand policy. Answer user query using the following document summary:
--- DOCUMENT START ---
${context}
--- DOCUMENT END ---
User Question: ${userQuery}

Give short and accurate answers based strictly on document content.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return responseText || "I could not generate a response.";
  } catch (err) {
    console.error("Gemini API Error:", err);
    const detail = err.message || "An unknown error occurred.";
    return `There was an issue contacting the Gemini API. [Details: ${detail}]`;
  }
};

// ============================================================
//  CREATE OR UPDATE CHAT SESSION (Policy Context)
// ============================================================
router.post('/session', fetchalluser, async (req, res) => {
  try {
    const { context } = req.body;

    if (!context || context.trim() === "") {
      return res.status(400).json({ error: "Context is required." });
    }

    const updatedSession = await ChatSession.findOneAndUpdate(
      { user: req.user.id },
      { context, createdAt: Date.now() },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: "Chat context updated successfully.",
      session: updatedSession
    });

  } catch (error) {
    console.error("Error updating chat session:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// ============================================================
//  CHATBOT RESPONSE (Uses Gemini + Stored Context)
// ============================================================
router.post('/', fetchalluser, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message is required." });
    }

    const session = await ChatSession.findOne({ user: req.user.id });
    const policyContext = session?.context || "";

    const chatbotResponse = await getGeminiResponse(message, policyContext);

    res.json({
      useroutput: message,
      chatbot: chatbotResponse
    });

  } catch (error) {
    console.error("Error in chatbot route:", error);
    res.status(500).json({ error: "Chatbot error occurred." });
  }
});

module.exports = router;
