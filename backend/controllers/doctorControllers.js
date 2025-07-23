const Doctor = require('../models/doctor');

async function registerDoctor(req, res) {
    const { name, email, speciality, address, location } = req.body;
    if (!name || !email || !speciality || !location || !address) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    if (!email.includes('@') || !email.includes('.')) {
        return res.status(400).json({ message: 'Invalid email address' });
    }
    if (typeof location !== 'object' || !location.coordinates || location.coordinates.length !== 2) {
        return res.status(400).json({ message: 'Invalid location' });
    }
    try {
        const doctor = await Doctor.create({ name, email, speciality, address, location });
        res.status(201).json({ message: 'Doctor registered successfully', doctor });
    } catch (error) {
        res.status(500).json({ message: 'Failed to register doctor', error: error.message });
    }
}

module.exports = { registerDoctor };
