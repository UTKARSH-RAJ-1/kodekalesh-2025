const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
console.log('Defining /login route');
router.post('/login', (req, res, next) => {
    console.log('Hit /login route');
    authController.login(req, res, next);
});

module.exports = router;
