require('dotenv').config();
const express = require('express');
const connectToMongo = require('./db');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB
connectToMongo();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/summary", require("./routes/summary"));
app.use("/api/feedback", require("./routes/feedback"));
app.use("/api/payment", require("./routes/payment"));
app.use("/api/chatbot", require("./routes/chatbot")); // Gemini integrated

// Default route
app.get('/', (req, res) => {
  res.send("Backend server running successfully.");
});

// Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;
