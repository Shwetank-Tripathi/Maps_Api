const express = require('express');
const router = express.Router();
const { getDoctorsByLocation } = require('../controllers/patientControllers');

router.get('/doc-search', getDoctorsByLocation);

module.exports = router;