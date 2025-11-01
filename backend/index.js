require('dotenv').config();
const express = require('express');
const connectToMongo = require('./db');
const cors = require('cors');
const morgan = require('morgan');
connectToMongo();
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Middleware
app.use(cors({
    origin: '*',  // Allow all origins (for dev), change as needed for production
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); // Enable JSON parsing
app.use(morgan('dev')); // ✅ Log requests to console

app.use('/api/auth', require('./routes/auth'));


app.use((err, req, res, next) => {
    console.error("Server Error:", err.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
});

// connect to MongoDB and start the server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});


app.get('/', (req, res) => {
    res.send("Hello World");

});