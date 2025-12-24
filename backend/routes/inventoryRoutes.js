const express = require('express');
const router = express.Router();
const controller = require('../controllers/inventoryController');

router.get('/expiry', controller.getExpiryData);
router.get('/raw-materials', controller.getRawMaterials);
router.get('/raw-materials/batches', controller.getRawMaterialBatches);
router.get('/traceability', controller.getTraceability);
router.get('/traceability/batch/:id', controller.getBatchDetails);

module.exports = router;
