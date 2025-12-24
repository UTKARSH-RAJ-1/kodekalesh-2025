const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');

router.get('/alerts', weatherController.checkWeatherDelays);

module.exports = router;
