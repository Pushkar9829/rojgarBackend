const express = require('express');
const router = express.Router();
const {
  getQualifications,
  createQualification,
  updateQualification,
  deleteQualification,
  getStreams,
  createStream,
  updateStream,
  deleteStream,
  getSkillCertificates,
  createSkillCertificate,
  updateSkillCertificate,
  deleteSkillCertificate,
  getJobTypes,
  createJobType,
  updateJobType,
  deleteJobType,
  getQualificationsPublic,
  getStreamsPublic,
  getSkillCertificatesPublic,
  getJobTypesPublic,
  getMasterConstants,
} = require('../controllers/masterDataController');
const { protect, authorize } = require('../middleware/auth');

// Public (app) – active master data + constants
router.get('/constants', getMasterConstants);
router.get('/qualifications', getQualificationsPublic);
router.get('/streams', getStreamsPublic);
router.get('/skill-certificates', getSkillCertificatesPublic);
router.get('/job-types', getJobTypesPublic);

// Admin CRUD – require ADMIN or SUPER_SUBADMIN (and later SUPER_ADMIN)
router.use(protect);
router.use(authorize('ADMIN', 'SUBADMIN', 'SUPER_ADMIN', 'SUPER_SUBADMIN'));

router
  .route('/admin/qualifications')
  .get(getQualifications)
  .post(createQualification);
router
  .route('/admin/qualifications/:id')
  .put(updateQualification)
  .delete(deleteQualification);

router
  .route('/admin/streams')
  .get(getStreams)
  .post(createStream);
router
  .route('/admin/streams/:id')
  .put(updateStream)
  .delete(deleteStream);

router
  .route('/admin/skill-certificates')
  .get(getSkillCertificates)
  .post(createSkillCertificate);
router
  .route('/admin/skill-certificates/:id')
  .put(updateSkillCertificate)
  .delete(deleteSkillCertificate);

router
  .route('/admin/job-types')
  .get(getJobTypes)
  .post(createJobType);
router
  .route('/admin/job-types/:id')
  .put(updateJobType)
  .delete(deleteJobType);

module.exports = router;
