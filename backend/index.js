require('dotenv').config();
const express = require('express');
const connectToMongo = require('./db');
const cors = require('cors');

connectToMongo();
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/summary", require("./routes/summary")); 



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});


app.get('/', (req, res) => {
    res.send("Hello World");

});