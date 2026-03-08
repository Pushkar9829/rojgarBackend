const Qualification = require('../models/Qualification');
const Stream = require('../models/Stream');
const SkillCertificate = require('../models/SkillCertificate');
const JobType = require('../models/JobType');
const { CATEGORIES, GENDERS, STATES } = require('../constants/masterData');

/**
 * Generic list for admin-managed master (active first, then by order)
 */
const listActive = (Model, sort = { order: 1, name: 1 }) =>
  Model.find({ isActive: true }).sort(sort).lean();

const listAll = (Model, sort = { order: 1, name: 1 }) => Model.find().sort(sort).lean();

/**
 * Qualifications
 */
const getQualifications = async (req, res, next) => {
  try {
    console.log('[masterDataController] getQualifications called', { query: req.query });
    const activeOnly = req.query.active !== 'false';
    const list = activeOnly ? await listActive(Qualification) : await listAll(Qualification);
    res.status(200).json({ success: true, data: { qualifications: list } });
  } catch (err) {
    next(err);
  }
};

const createQualification = async (req, res, next) => {
  try {
    console.log('[masterDataController] createQualification called', { name: req.body?.name });
    const q = await Qualification.create(req.body);
    res.status(201).json({ success: true, data: { qualification: q } });
  } catch (err) {
    next(err);
  }
};

const updateQualification = async (req, res, next) => {
  try {
    console.log('[masterDataController] updateQualification called', { id: req.params.id });
    const q = await Qualification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!q) return res.status(404).json({ success: false, message: 'Qualification not found' });
    res.status(200).json({ success: true, data: { qualification: q } });
  } catch (err) {
    next(err);
  }
};

const deleteQualification = async (req, res, next) => {
  try {
    console.log('[masterDataController] deleteQualification called', { id: req.params.id });
    const q = await Qualification.findByIdAndDelete(req.params.id);
    if (!q) return res.status(404).json({ success: false, message: 'Qualification not found' });
    res.status(200).json({ success: true, message: 'Qualification deleted' });
  } catch (err) {
    next(err);
  }
};

/**
 * Streams
 */
const getStreams = async (req, res, next) => {
  try {
    console.log('[masterDataController] getStreams called', { query: req.query });
    const activeOnly = req.query.active !== 'false';
    const query = activeOnly ? { isActive: true } : {};
    const list = await Stream.find(query).sort({ order: 1, name: 1 }).populate('qualificationId', 'name').lean();
    res.status(200).json({ success: true, data: { streams: list } });
  } catch (err) {
    next(err);
  }
};

const createStream = async (req, res, next) => {
  try {
    console.log('[masterDataController] createStream called', { name: req.body?.name });
    const s = await Stream.create(req.body);
    res.status(201).json({ success: true, data: { stream: s } });
  } catch (err) {
    next(err);
  }
};

const updateStream = async (req, res, next) => {
  try {
    const s = await Stream.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!s) return res.status(404).json({ success: false, message: 'Stream not found' });
    res.status(200).json({ success: true, data: { stream: s } });
  } catch (err) {
    next(err);
  }
};

const deleteStream = async (req, res, next) => {
  try {
    const s = await Stream.findByIdAndDelete(req.params.id);
    if (!s) return res.status(404).json({ success: false, message: 'Stream not found' });
    res.status(200).json({ success: true, message: 'Stream deleted' });
  } catch (err) {
    next(err);
  }
};

/**
 * Skills & Certificates
 */
const getSkillCertificates = async (req, res, next) => {
  try {
    console.log('[masterDataController] getSkillCertificates called', { query: req.query });
    const activeOnly = req.query.active !== 'false';
    const list = activeOnly ? await listActive(SkillCertificate) : await listAll(SkillCertificate);
    res.status(200).json({ success: true, data: { skillCertificates: list } });
  } catch (err) {
    next(err);
  }
};

const createSkillCertificate = async (req, res, next) => {
  try {
    console.log('[masterDataController] createSkillCertificate called', { name: req.body?.name });
    const s = await SkillCertificate.create(req.body);
    res.status(201).json({ success: true, data: { skillCertificate: s } });
  } catch (err) {
    next(err);
  }
};

const updateSkillCertificate = async (req, res, next) => {
  try {
    const s = await SkillCertificate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!s) return res.status(404).json({ success: false, message: 'Skill/Certificate not found' });
    res.status(200).json({ success: true, data: { skillCertificate: s } });
  } catch (err) {
    next(err);
  }
};

const deleteSkillCertificate = async (req, res, next) => {
  try {
    const s = await SkillCertificate.findByIdAndDelete(req.params.id);
    if (!s) return res.status(404).json({ success: false, message: 'Skill/Certificate not found' });
    res.status(200).json({ success: true, message: 'Skill/Certificate deleted' });
  } catch (err) {
    next(err);
  }
};

/**
 * Job Types
 */
const getJobTypes = async (req, res, next) => {
  try {
    console.log('[masterDataController] getJobTypes called', { query: req.query });
    const activeOnly = req.query.active !== 'false';
    const list = activeOnly ? await listActive(JobType) : await listAll(JobType);
    res.status(200).json({ success: true, data: { jobTypes: list } });
  } catch (err) {
    next(err);
  }
};

const createJobType = async (req, res, next) => {
  try {
    console.log('[masterDataController] createJobType called', { name: req.body?.name, code: req.body?.code });
    const j = await JobType.create(req.body);
    res.status(201).json({ success: true, data: { jobType: j } });
  } catch (err) {
    next(err);
  }
};

const updateJobType = async (req, res, next) => {
  try {
    const j = await JobType.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!j) return res.status(404).json({ success: false, message: 'Job type not found' });
    res.status(200).json({ success: true, data: { jobType: j } });
  } catch (err) {
    next(err);
  }
};

const deleteJobType = async (req, res, next) => {
  try {
    const j = await JobType.findByIdAndDelete(req.params.id);
    if (!j) return res.status(404).json({ success: false, message: 'Job type not found' });
    res.status(200).json({ success: true, message: 'Job type deleted' });
  } catch (err) {
    next(err);
  }
};

/**
 * Public/App: list active only (no auth or optional auth for app)
 */
const getQualificationsPublic = async (req, res, next) => {
  try {
    const list = await listActive(Qualification);
    res.status(200).json({ success: true, data: { qualifications: list } });
  } catch (err) {
    next(err);
  }
};

const getStreamsPublic = async (req, res, next) => {
  try {
    const list = await listActive(Stream);
    res.status(200).json({ success: true, data: { streams: list } });
  } catch (err) {
    next(err);
  }
};

const getSkillCertificatesPublic = async (req, res, next) => {
  try {
    const list = await listActive(SkillCertificate);
    res.status(200).json({ success: true, data: { skillCertificates: list } });
  } catch (err) {
    next(err);
  }
};

const getJobTypesPublic = async (req, res, next) => {
  try {
    const list = await listActive(JobType);
    res.status(200).json({ success: true, data: { jobTypes: list } });
  } catch (err) {
    next(err);
  }
};

const getMasterConstants = async (req, res, next) => {
  try {
    console.log('[masterDataController] getMasterConstants called');
    res.status(200).json({
      success: true,
      data: {
        categories: CATEGORIES,
        genders: GENDERS,
        states: STATES,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
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
};
