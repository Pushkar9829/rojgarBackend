const express = require('express');
const router = express.Router();
const {
  createJob,
  updateJob,
  deleteJob,
  approveJob,
  rejectJob,
  createScheme,
  updateScheme,
  deleteScheme,
  getUsers,
  getStats,
} = require('../controllers/adminController');
const {
  createSubadmin,
  verifySubadmin,
  rejectSubadmin,
  getSubadmins,
  getSubadminById,
  updateSubadmin,
  updateSubadminPermissions,
  deactivateSubadmin,
  activateSubadmin,
  getAuditLogs,
} = require('../controllers/subadminController');
const {
  getSuperSubadmins,
  getSuperSubadminById,
  createSuperSubadmin,
  updateSuperSubadmin,
  deactivateSuperSubadmin,
  activateSuperSubadmin,
} = require('../controllers/superSubadminController');
const { protect, authorize, checkPermission } = require('../middleware/auth');

// All admin routes require authentication and admin/subadmin role
router.use(protect);
router.use(authorize('ADMIN', 'SUBADMIN', 'SUPER_ADMIN', 'SUPER_SUBADMIN'));

// Jobs CRUD
router.post('/jobs', checkPermission('CREATE_JOBS'), createJob);
router.put('/jobs/:id', checkPermission('EDIT_JOBS'), updateJob);
router.delete('/jobs/:id', checkPermission('DELETE_JOBS'), deleteJob);
// Approve/Reject job (ADMIN, SUPER_ADMIN, SUPER_SUBADMIN only – no SUBADMIN)
const approveRejectRoles = (req, res, next) => {
  if (['ADMIN', 'SUPER_ADMIN', 'SUPER_SUBADMIN'].includes(req.user.role)) return next();
  return res.status(403).json({ success: false, message: 'Only Admin or Super Sub-admin can approve or reject jobs' });
};
router.post('/jobs/:id/approve', approveRejectRoles, approveJob);
router.post('/jobs/:id/reject', approveRejectRoles, rejectJob);

// Schemes CRUD
router.post('/schemes', checkPermission('CREATE_SCHEMES'), createScheme);
router.put('/schemes/:id', checkPermission('EDIT_SCHEMES'), updateScheme);
router.delete('/schemes/:id', checkPermission('DELETE_SCHEMES'), deleteScheme);

// User management
router.get('/users', checkPermission('VIEW_USERS'), getUsers);

// Dashboard stats
router.get('/stats', getStats);

// Subadmin management (requires MANAGE_ADMINS permission)
router.post('/subadmins', checkPermission('MANAGE_ADMINS'), createSubadmin);
router.get('/subadmins', checkPermission('MANAGE_ADMINS'), getSubadmins);
router.get('/subadmins/:id', checkPermission('MANAGE_ADMINS'), getSubadminById);
router.put('/subadmins/:id', checkPermission('MANAGE_ADMINS'), updateSubadmin);
router.put('/subadmins/:id/permissions', checkPermission('MANAGE_ADMINS'), updateSubadminPermissions);
router.post('/subadmins/:id/verify', checkPermission('MANAGE_ADMINS'), verifySubadmin);
router.post('/subadmins/:id/reject', checkPermission('MANAGE_ADMINS'), rejectSubadmin);
router.post('/subadmins/:id/activate', checkPermission('MANAGE_ADMINS'), activateSubadmin);
router.post('/subadmins/:id/deactivate', checkPermission('MANAGE_ADMINS'), deactivateSubadmin);

// Audit logs
router.get('/audit-logs', checkPermission('MANAGE_ADMINS'), getAuditLogs);

// Super Sub-Admins (only SUPER_ADMIN or ADMIN)
const superAdminOnly = (req, res, next) => {
  if (['SUPER_ADMIN', 'ADMIN'].includes(req.user.role)) return next();
  return res.status(403).json({ success: false, message: 'Only Super Admin can manage Super Sub-Admins' });
};
router.get('/super-subadmins', superAdminOnly, getSuperSubadmins);
router.get('/super-subadmins/:id', superAdminOnly, getSuperSubadminById);
router.post('/super-subadmins', superAdminOnly, createSuperSubadmin);
router.put('/super-subadmins/:id', superAdminOnly, updateSuperSubadmin);
router.post('/super-subadmins/:id/deactivate', superAdminOnly, deactivateSuperSubadmin);
router.post('/super-subadmins/:id/activate', superAdminOnly, activateSuperSubadmin);

module.exports = router;