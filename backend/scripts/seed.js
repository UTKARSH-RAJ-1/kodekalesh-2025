const sequelize = require('../config/database');
const User = require('../models/User');
const Inventory = require('../models/Inventory');
const bcrypt = require('bcrypt');
const data = require('../config/data');

async function seedDatabase() {
    try {
        // Sync Database
        await sequelize.sync({ force: true }); // WARNING: This drops tables!
        console.log('Database synced!');

        // Create Admin User
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await User.create({
            username: 'admin',
            password: hashedPassword,
            role: 'admin'
        });
        console.log('Admin user created (admin / admin123)');

        // Seed Inventory (Expiry Data)
        for (const item of data.expiryData) {
            await Inventory.create({
                name: item.name,
                batchId: item.batchId,
                quantity: item.quantity,
                unit: item.unit,
                expiryDate: item.expiryDate,
                type: 'finished_good'
            });
        }

        // Seed Raw Materials (Summary)
        for (const material of data.rawMaterialData) {
            // Note: In a real app relational DB, this would be different (Product -> Batches)
            // For now, we are storing summary info as a separate record or we could aggregate.
            // Let's store them as generic records for the dashboard
            await Inventory.create({
                name: material.name,
                batchId: `SUMMARY-${material.name}`,
                quantity: material.current_stock,
                unit: material.unit,
                expiryDate: '2099-12-31', // Dummy
                type: 'raw_material_summary',
                current_stock: material.current_stock,
                max_stock: material.max_stock,
                daily_consumption: material.daily_consumption
            });
        }

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
