const weatherService = require('../services/weatherService');

exports.checkWeatherDelays = async (req, res) => {
    const alerts = [];

    // Check all known supplier locations for Fog
    for (const [supplier, coords] of Object.entries(weatherService.SUPPLIER_LOCATIONS)) {
        const weather = await weatherService.getFogForecast(coords.lat, coords.lon);
        if (weather.hasFog) {
            alerts.push({
                supplier,
                alertType: 'Weather Delay',
                message: `Fog detected at ${supplier} location. Expect delivery delays.`,
                data: weather
            });
        }
    }

    res.json({ alerts });
};
