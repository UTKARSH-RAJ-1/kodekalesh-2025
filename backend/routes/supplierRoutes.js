const express = require('express');
const router = express.Router();
const controller = require('../controllers/supplierController');

router.get('/suppliers', controller.getSuppliers);

module.exports = router;
