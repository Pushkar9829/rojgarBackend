const express = require('express');
const router = express.Router();
const {
  createJob,
  updateJob,
  deleteJob,
  createScheme,
  updateScheme,
  deleteScheme,
  getUsers,
  getStats,
} = require('../controllers/adminController');
const { protect, authorize, checkPermission } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('ADMIN'));

// Jobs CRUD
router.post('/jobs', checkPermission('CREATE_JOBS'), createJob);
router.put('/jobs/:id', checkPermission('EDIT_JOBS'), updateJob);
router.delete('/jobs/:id', checkPermission('DELETE_JOBS'), deleteJob);

// Schemes CRUD
router.post('/schemes', checkPermission('CREATE_SCHEMES'), createScheme);
router.put('/schemes/:id', checkPermission('EDIT_SCHEMES'), updateScheme);
router.delete('/schemes/:id', checkPermission('DELETE_SCHEMES'), deleteScheme);

// User management
router.get('/users', checkPermission('VIEW_USERS'), getUsers);

// Dashboard stats
router.get('/stats', getStats);

module.exports = router;