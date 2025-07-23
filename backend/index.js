const express = require('express');
const connectDB = require('./connection');
const cors = require('cors');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});






