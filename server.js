require('dotenv').config ();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const pool = require('./db');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

const patientRoutes = require('./routes/patient');

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to Clinic Management');
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));