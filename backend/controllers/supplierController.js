const data = require('../config/data');

const getSuppliers = (req, res) => {
    const material = req.query.material;
    if (material === 'wheat') {
        res.json(data.wheatSupplierData);
    } else if (material === 'potato') {
        res.json(data.potatoSupplierData);
    } else if (material === 'maize') {
        res.json(data.maizeSupplierData);
    } else {
        res.status(400).json({ error: 'Invalid material parameter' });
    }
};

module.exports = {
    getSuppliers
};
