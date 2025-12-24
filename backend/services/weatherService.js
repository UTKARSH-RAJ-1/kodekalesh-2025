const axios = require('axios'); // I need to install axios first, wait. I will use fetch instead since node 18+ has it, or just install axios. The plan mentioned installing axios. I forgot to install axios in previous steps? No, I only installed sqlite3 sequelize bcrypt jsonwebtoken. I should install axios.

// Let's use native fetch if available (Node 18+), but safer to install axios as per plan. 
// Actually, I'll install axios in the next step.

const getFogForecast = async (latitude, longitude) => {
    try {
        // Open-Meteo API (No key required)
        // Checking for 'visibility' or 'weathercode'
        // WMO Weather interpretation codes (WW)
        // Code 45, 48 = Fog
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode&timezone=auto`;

        // Use dynamic import for node-fetch or ensure axios is installed.
        // I will write this file assuming axios is available, and I will strictly run npm install axios next.
        const response = await axios.get(url);
        const dailyCodes = response.data.daily.weathercode;

        // Check if any of the next 3 days has fog (Code 45 or 48)
        const hasFog = dailyCodes.some(code => code === 45 || code === 48);

        return {
            hasFog,
            forecast: dailyCodes,
            location: { lat: latitude, lon: longitude }
        };
    } catch (error) {
        console.error('Error fetching weather:', error.message);
        return { hasFog: false, error: true }; // Fallback
    }
};

const SUPPLIER_LOCATIONS = {
    'Kanpur Wheat Co-op': { lat: 26.4499, lon: 80.3319 },
    'Punjab Golden Fields': { lat: 30.9010, lon: 75.8573 },
    'Agra Potato Growers': { lat: 27.1767, lon: 78.0081 },
    // Add more as needed
};

module.exports = {
    getFogForecast,
    SUPPLIER_LOCATIONS
};
