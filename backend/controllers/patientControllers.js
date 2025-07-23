const Doctor = require('../models/doctor');

async function getDoctorsByLocation(req, res) {
    const { latitude, longitude } = req.query;
    if (!latitude || !longitude) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
    }
    if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ message: 'Latitude and longitude must be numbers' });
    }
    try {
        const doctors = await Doctor.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: 10000
                }
            }
        });
        res.status(200).json({ doctors });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get doctors by location', error: error.message });
    }
}

module.exports = { getDoctorsByLocation };