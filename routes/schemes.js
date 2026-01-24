const express = require('express');
const router = express.Router();
const { getSchemes, getSchemeById, getEligibleSchemes } = require('../controllers/schemeController');
const { protect } = require('../middleware/auth');

router.get('/', getSchemes);
router.get('/eligible', protect, getEligibleSchemes);
router.get('/:id', getSchemeById);

module.exports = router;