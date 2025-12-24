const { Sequelize } = require('sequelize');
const path = require('path');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../database.sqlite'), // Store DB in project root
    logging: false, // Set to console.log to see SQL queries
});

module.exports = sequelize;
