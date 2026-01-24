const express = require('express');
const router = express.Router();
const { getJobs, getJobById, getEligibleJobs } = require('../controllers/jobController');
const { protect } = require('../middleware/auth');

router.get('/', getJobs);
router.get('/eligible', protect, getEligibleJobs);
router.get('/:id', getJobById);

module.exports = router;