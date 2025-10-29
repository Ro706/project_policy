require('dotenv').config();
const connectToMongo = require('./db');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
connectToMongo();
const app = express();
const port = 5000;

// Middleware
app.use(cors({
    origin: '*',  // Allow all origins (for dev), change as needed for production
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); // Enable JSON parsing
app.use(morgan('dev')); // ✅ Log requests to console
// define routes
app.use('/api/auth', require('./routes/auth'));

// ✅ Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("Server Error:", err.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
});

// Connect to MongoDB
app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`);
})

app.get('/', (req, res) => {
    res.send("Hello World");

});