const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Inventory = sequelize.define('Inventory', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    batchId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    quantity: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    unit: {
        type: DataTypes.STRING,
        allowNull: false
    },
    expiryDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING, // 'raw_material', 'finished_good'
        defaultValue: 'raw_material'
    },
    current_stock: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    max_stock: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    daily_consumption: {
        type: DataTypes.FLOAT,
        allowNull: true
    }
});

module.exports = Inventory;
