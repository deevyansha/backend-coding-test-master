const express = require('express');
const router = express.Router();

const { getRides, getRideById, createRide } = require('../controllers/rides.js');

router.get('/', getRides);
router.get('/:id', getRideById);
router.post('/', createRide);

module.exports = router;
