const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const createAuditLog = async (action, performedBy, targetUser, details, status, errorMessage, req) => {
  try {
    await AuditLog.create({
      action,
      performedBy,
      targetUser: targetUser || undefined,
      details: details || {},
      status: status || 'SUCCESS',
      errorMessage: errorMessage || undefined,
      ipAddress: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.get?.('User-Agent'),
    });
  } catch (e) {
    console.error('[superSubadminController] Audit log error:', e);
  }
};

/**
 * List all Super Sub-Admins. Only SUPER_ADMIN or ADMIN.
 */
const getSuperSubadmins = async (req, res, next) => {
  try {
    console.log('[superSubadminController] getSuperSubadmins called', { userId: req.user._id });
    const list = await User.find({ role: 'SUPER_SUBADMIN' })
      .select('mobileNumber adminProfile role isActive createdAt')
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json({
      success: true,
      data: { superSubadmins: list },
      count: list.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get one Super Sub-Admin by ID.
 */
const getSuperSubadminById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-__v').lean();
    if (!user || user.role !== 'SUPER_SUBADMIN') {
      console.log('[superSubadminController] getSuperSubadminById not found:', req.params.id);
      return res.status(404).json({ success: false, message: 'Super Sub-Admin not found' });
    }
    console.log('[superSubadminController] getSuperSubadminById success', { id: user._id });
    res.status(200).json({ success: true, data: { superSubadmin: user } });
  } catch (error) {
    console.error('[superSubadminController] getSuperSubadminById error:', error);
    next(error);
  }
};

/**
 * Create a Super Sub-Admin. They can log in with OTP; no verification workflow.
 */
const createSuperSubadmin = async (req, res, next) => {
  try {
    console.log('[superSubadminController] createSuperSubadmin called', { performedBy: req.user._id, mobileNumber: req.body?.mobileNumber, name: req.body?.name });
    const { mobileNumber, name, email, permissions, assignedStates } = req.body;

    if (!mobileNumber || !/^\d{10}$/.test(mobileNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Valid 10-digit mobile number is required',
      });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      });
    }

    let user = await User.findOne({ mobileNumber });

    if (user) {
      if (['ADMIN', 'SUPER_ADMIN', 'SUBADMIN', 'SUPER_SUBADMIN'].includes(user.role)) {
        return res.status(400).json({
          success: false,
          message: 'This number is already an admin or sub-admin',
        });
      }
      user.role = 'SUPER_SUBADMIN';
      user.adminProfile = {
        name: name.trim(),
        email: email?.toLowerCase().trim() || undefined,
        permissions: permissions || [],
        assignedStates: assignedStates || [],
        verificationStatus: 'VERIFIED',
        verifiedBy: req.user._id,
        verifiedAt: new Date(),
      };
      user.isActive = true;
      await user.save();
    } else {
      user = await User.create({
        mobileNumber,
        role: 'SUPER_SUBADMIN',
        isActive: true,
        adminProfile: {
          name: name.trim(),
          email: email?.toLowerCase().trim() || undefined,
          permissions: permissions || [],
          assignedStates: assignedStates || [],
          verificationStatus: 'VERIFIED',
          verifiedBy: req.user._id,
          verifiedAt: new Date(),
        },
      });
    }

    await createAuditLog(
      'SUPER_SUBADMIN_CREATED',
      req.user._id,
      user._id,
      { mobileNumber: user.mobileNumber, name: user.adminProfile.name },
      'SUCCESS',
      null,
      req
    );

    console.log('[superSubadminController] createSuperSubadmin success', { userId: user._id, mobileNumber: user.mobileNumber });
    res.status(201).json({
      success: true,
      message: 'Super Sub-Admin created successfully',
      data: { superSubadmin: user },
    });
  } catch (error) {
    console.error('[superSubadminController] createSuperSubadmin error:', error);
    next(error);
  }
};

/**
 * Update Super Sub-Admin (name, email, permissions, assignedStates).
 */
const updateSuperSubadmin = async (req, res, next) => {
  try {
    console.log('[superSubadminController] updateSuperSubadmin called', { id: req.params.id, performedBy: req.user._id });
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'SUPER_SUBADMIN') {
      return res.status(404).json({ success: false, message: 'Super Sub-Admin not found' });
    }

    const { name, email, permissions, assignedStates } = req.body;
    if (name !== undefined) user.adminProfile.name = name.trim();
    if (email !== undefined) user.adminProfile.email = email?.toLowerCase().trim() || undefined;
    if (permissions !== undefined) user.adminProfile.permissions = permissions;
    if (assignedStates !== undefined) user.adminProfile.assignedStates = assignedStates;

    await user.save();

    await createAuditLog(
      'SUPER_SUBADMIN_UPDATED',
      req.user._id,
      user._id,
      { name: user.adminProfile.name, email: user.adminProfile.email },
      'SUCCESS',
      null,
      req
    );

    console.log('[superSubadminController] updateSuperSubadmin success', { id: user._id });
    res.status(200).json({
      success: true,
      message: 'Super Sub-Admin updated',
      data: { superSubadmin: user },
    });
  } catch (error) {
    console.error('[superSubadminController] updateSuperSubadmin error:', error);
    next(error);
  }
};

/**
 * Deactivate a Super Sub-Admin.
 */
const deactivateSuperSubadmin = async (req, res, next) => {
  try {
    console.log('[superSubadminController] deactivateSuperSubadmin called', { id: req.params.id, performedBy: req.user._id });
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'SUPER_SUBADMIN') {
      return res.status(404).json({ success: false, message: 'Super Sub-Admin not found' });
    }
    if (req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate yourself',
      });
    }
    user.isActive = false;
    await user.save();

    await createAuditLog(
      'SUPER_SUBADMIN_DEACTIVATED',
      req.user._id,
      user._id,
      { mobileNumber: user.mobileNumber },
      'SUCCESS',
      null,
      req
    );

    res.status(200).json({
      success: true,
      message: 'Super Sub-Admin deactivated',
      data: { superSubadmin: user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Activate a Super Sub-Admin.
 */
const activateSuperSubadmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'SUPER_SUBADMIN') {
      return res.status(404).json({ success: false, message: 'Super Sub-Admin not found' });
    }
    user.isActive = true;
    await user.save();

    await createAuditLog(
      'SUPER_SUBADMIN_ACTIVATED',
      req.user._id,
      user._id,
      { mobileNumber: user.mobileNumber },
      'SUCCESS',
      null,
      req
    );

    console.log('[superSubadminController] activateSuperSubadmin success', { id: user._id });
    res.status(200).json({
      success: true,
      message: 'Super Sub-Admin activated',
      data: { superSubadmin: user },
    });
  } catch (error) {
    console.error('[superSubadminController] activateSuperSubadmin error:', error);
    next(error);
  }
};

module.exports = {
  getSuperSubadmins,
  getSuperSubadminById,
  createSuperSubadmin,
  updateSuperSubadmin,
  deactivateSuperSubadmin,
  activateSuperSubadmin,
};
