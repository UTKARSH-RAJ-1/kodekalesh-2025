const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/database');

const app = express();
const PORT = 3000;

// Import Routes
const inventoryRoutes = require('./routes/inventoryRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const authRoutes = require('./routes/authRoutes');
const weatherRoutes = require('./routes/weatherRoutes');

// --- 1. MIDDLEWARE SETUP ---
app.use(cors()); // Allow requests from other origins
app.use(express.json()); // Parse JSON bodies

// Serve static frontend files from the root directory safely
app.get('/style.css', (req, res) => {
    res.sendFile(path.join(__dirname, '../style.css'));
});
app.use('/js', express.static(path.join(__dirname, '../js')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// --- 2. API ROUTES ---
console.log('Mounting Inventory Routes...');
app.use('/api', inventoryRoutes);
console.log('Mounting Supplier Routes...');
app.use('/api', supplierRoutes);
console.log('Mounting Auth Routes...');
app.use('/api', authRoutes);
console.log('Mounting Weather Routes...');
app.use('/api', weatherRoutes);
console.log('All routes mounted.');

// --- 3. DATABASE & START SERVER ---
// Sync database (creates tables if they don't exist)
sequelize.sync().then(() => {
    console.log('✅ Database connected & synced');
    app.listen(PORT, () => {
        console.log(`✅ Inventory Server is running!`);
        console.log(`👉 Open your browser to: http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('❌ Database connection error:', err);
});
