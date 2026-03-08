const express = require('express');
const router = express.Router();
const { getJobs, getJobById, getEligibleJobs, askJob } = require('../controllers/jobController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getJobs);
router.get('/eligible', protect, getEligibleJobs);
router.get('/:id', optionalAuth, getJobById);
router.post('/:id/ask', protect, askJob);

module.exports = router;