const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

/**
 * Helper function to create audit log entry
 */
const createAuditLog = async (action, performedBy, targetUser, details = {}, status = 'SUCCESS', errorMessage = null, req = null) => {
  try {
    await AuditLog.create({
      action,
      performedBy,
      targetUser,
      details,
      status,
      errorMessage,
      ipAddress: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.get('user-agent'),
    });
  } catch (error) {
    console.error('[subadminController] Failed to create audit log:', error);
    // Don't throw error - audit logging should not break the main flow
  }
};

/**
 * Create a new subadmin (onboarding request)
 */
const createSubadmin = async (req, res, next) => {
  try {
    const { mobileNumber, name, email, permissions, assignedStates } = req.body;

    // Validate required fields
    if (!mobileNumber || !/^\d{10}$/.test(mobileNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Valid 10-digit mobile number is required',
      });
    }

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      });
    }

    // Check if user already exists
    let user = await User.findOne({ mobileNumber });
    
    if (user) {
      if (user.role === 'ADMIN') {
        return res.status(400).json({
          success: false,
          message: 'User is already an admin',
        });
      }
      // Convert existing user to admin
      user.role = 'ADMIN';
      user.adminProfile = {
        name: name.trim(),
        email: email?.toLowerCase().trim() || undefined,
        permissions: permissions || [],
        assignedStates: assignedStates || [],
        verificationStatus: 'PENDING',
        onboardingRequestedAt: new Date(),
      };
      await user.save();
    } else {
      // Create new admin user
      user = await User.create({
        mobileNumber,
        role: 'ADMIN',
        isActive: false, // Inactive until verified
        adminProfile: {
          name: name.trim(),
          email: email?.toLowerCase().trim() || undefined,
          permissions: permissions || [],
          assignedStates: assignedStates || [],
          verificationStatus: 'PENDING',
          onboardingRequestedAt: new Date(),
        },
      });
    }

    // Create audit log
    await createAuditLog(
      'SUBADMIN_CREATED',
      req.user._id,
      user._id,
      {
        mobileNumber: user.mobileNumber,
        name: user.adminProfile.name,
        email: user.adminProfile.email,
        permissions: user.adminProfile.permissions,
        assignedStates: user.adminProfile.assignedStates,
      },
      'SUCCESS',
      null,
      req
    );

    res.status(201).json({
      success: true,
      message: 'Subadmin onboarding request created successfully',
      data: {
        subadmin: user,
      },
    });
  } catch (error) {
    console.error('[subadminController] createSubadmin error:', error);
    
    // Create audit log for failure
    if (req.body.mobileNumber) {
      const targetUser = await User.findOne({ mobileNumber: req.body.mobileNumber }).catch(() => null);
      if (targetUser) {
        await createAuditLog(
          'SUBADMIN_CREATED',
          req.user._id,
          targetUser._id,
          req.body,
          'FAILED',
          error.message,
          req
        );
      }
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number or email already exists',
      });
    }
    next(error);
  }
};

/**
 * Verify/Approve a subadmin
 */
const verifySubadmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const subadmin = await User.findById(id);

    if (!subadmin) {
      return res.status(404).json({
        success: false,
        message: 'Subadmin not found',
      });
    }

    if (subadmin.role !== 'ADMIN') {
      return res.status(400).json({
        success: false,
        message: 'User is not an admin',
      });
    }

    if (subadmin.adminProfile.verificationStatus === 'VERIFIED') {
      return res.status(400).json({
        success: false,
        message: 'Subadmin is already verified',
      });
    }

    // Update verification status
    subadmin.adminProfile.verificationStatus = 'VERIFIED';
    subadmin.adminProfile.verifiedBy = req.user._id;
    subadmin.adminProfile.verifiedAt = new Date();
    subadmin.isActive = true;
    await subadmin.save();

    // Create audit log
    await createAuditLog(
      'SUBADMIN_VERIFIED',
      req.user._id,
      subadmin._id,
      {
        mobileNumber: subadmin.mobileNumber,
        name: subadmin.adminProfile.name,
        notes: notes || null,
      },
      'SUCCESS',
      null,
      req
    );

    res.status(200).json({
      success: true,
      message: 'Subadmin verified successfully',
      data: {
        subadmin,
      },
    });
  } catch (error) {
    console.error('[subadminController] verifySubadmin error:', error);
    next(error);
  }
};

/**
 * Reject a subadmin
 */
const rejectSubadmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required',
      });
    }

    const subadmin = await User.findById(id);

    if (!subadmin) {
      return res.status(404).json({
        success: false,
        message: 'Subadmin not found',
      });
    }

    if (subadmin.role !== 'ADMIN') {
      return res.status(400).json({
        success: false,
        message: 'User is not an admin',
      });
    }

    if (subadmin.adminProfile.verificationStatus === 'REJECTED') {
      return res.status(400).json({
        success: false,
        message: 'Subadmin is already rejected',
      });
    }

    // Update verification status
    subadmin.adminProfile.verificationStatus = 'REJECTED';
    subadmin.adminProfile.verifiedBy = req.user._id;
    subadmin.adminProfile.verifiedAt = new Date();
    subadmin.adminProfile.rejectionReason = reason.trim();
    subadmin.isActive = false;
    await subadmin.save();

    // Create audit log
    await createAuditLog(
      'SUBADMIN_REJECTED',
      req.user._id,
      subadmin._id,
      {
        mobileNumber: subadmin.mobileNumber,
        name: subadmin.adminProfile.name,
        reason: reason.trim(),
      },
      'SUCCESS',
      null,
      req
    );

    res.status(200).json({
      success: true,
      message: 'Subadmin rejected successfully',
      data: {
        subadmin,
      },
    });
  } catch (error) {
    console.error('[subadminController] rejectSubadmin error:', error);
    next(error);
  }
};

/**
 * Get list of subadmins with filters
 */
const getSubadmins = async (req, res, next) => {
  try {
    const {
      verificationStatus,
      isActive,
      page = 1,
      limit = 20,
      sort = '-createdAt',
      search,
    } = req.query;

    // Build filter object
    const filter = { role: 'ADMIN' };

    if (verificationStatus) {
      filter['adminProfile.verificationStatus'] = verificationStatus;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (search) {
      filter.$or = [
        { mobileNumber: { $regex: search, $options: 'i' } },
        { 'adminProfile.name': { $regex: search, $options: 'i' } },
        { 'adminProfile.email': { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const subadmins = await User.find(filter)
      .select('-__v -profile')
      .populate('adminProfile.verifiedBy', 'adminProfile.name mobileNumber')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: subadmins.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: {
        subadmins,
      },
    });
  } catch (error) {
    console.error('[subadminController] getSubadmins error:', error);
    next(error);
  }
};

/**
 * Get single subadmin by ID
 */
const getSubadminById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subadmin = await User.findById(id)
      .select('-__v -profile')
      .populate('adminProfile.verifiedBy', 'adminProfile.name mobileNumber');

    if (!subadmin || subadmin.role !== 'ADMIN') {
      return res.status(404).json({
        success: false,
        message: 'Subadmin not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        subadmin,
      },
    });
  } catch (error) {
    console.error('[subadminController] getSubadminById error:', error);
    next(error);
  }
};

/**
 * Update subadmin
 */
const updateSubadmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, permissions, assignedStates } = req.body;

    const subadmin = await User.findById(id);

    if (!subadmin || subadmin.role !== 'ADMIN') {
      return res.status(404).json({
        success: false,
        message: 'Subadmin not found',
      });
    }

    // Store old values for audit log
    const oldValues = {
      name: subadmin.adminProfile.name,
      email: subadmin.adminProfile.email,
      permissions: [...subadmin.adminProfile.permissions],
      assignedStates: [...subadmin.adminProfile.assignedStates],
    };

    // Update fields
    if (name) subadmin.adminProfile.name = name.trim();
    if (email !== undefined) subadmin.adminProfile.email = email?.toLowerCase().trim() || undefined;
    if (permissions) subadmin.adminProfile.permissions = permissions;
    if (assignedStates) subadmin.adminProfile.assignedStates = assignedStates;

    await subadmin.save();

    // Create audit log
    await createAuditLog(
      'SUBADMIN_UPDATED',
      req.user._id,
      subadmin._id,
      {
        oldValues,
        newValues: {
          name: subadmin.adminProfile.name,
          email: subadmin.adminProfile.email,
          permissions: subadmin.adminProfile.permissions,
          assignedStates: subadmin.adminProfile.assignedStates,
        },
      },
      'SUCCESS',
      null,
      req
    );

    res.status(200).json({
      success: true,
      message: 'Subadmin updated successfully',
      data: {
        subadmin,
      },
    });
  } catch (error) {
    console.error('[subadminController] updateSubadmin error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }
    next(error);
  }
};

/**
 * Update subadmin permissions
 */
const updateSubadminPermissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    if (!permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: 'Permissions array is required',
      });
    }

    const subadmin = await User.findById(id);

    if (!subadmin || subadmin.role !== 'ADMIN') {
      return res.status(404).json({
        success: false,
        message: 'Subadmin not found',
      });
    }

    const oldPermissions = [...subadmin.adminProfile.permissions];
    subadmin.adminProfile.permissions = permissions;
    await subadmin.save();

    // Create audit log
    await createAuditLog(
      'SUBADMIN_PERMISSIONS_UPDATED',
      req.user._id,
      subadmin._id,
      {
        oldPermissions,
        newPermissions: permissions,
      },
      'SUCCESS',
      null,
      req
    );

    res.status(200).json({
      success: true,
      message: 'Subadmin permissions updated successfully',
      data: {
        subadmin,
      },
    });
  } catch (error) {
    console.error('[subadminController] updateSubadminPermissions error:', error);
    next(error);
  }
};

/**
 * Deactivate subadmin
 */
const deactivateSubadmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subadmin = await User.findById(id);

    if (!subadmin || subadmin.role !== 'ADMIN') {
      return res.status(404).json({
        success: false,
        message: 'Subadmin not found',
      });
    }

    if (!subadmin.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Subadmin is already deactivated',
      });
    }

    subadmin.isActive = false;
    await subadmin.save();

    // Create audit log
    await createAuditLog(
      'SUBADMIN_DEACTIVATED',
      req.user._id,
      subadmin._id,
      {
        mobileNumber: subadmin.mobileNumber,
        name: subadmin.adminProfile.name,
      },
      'SUCCESS',
      null,
      req
    );

    res.status(200).json({
      success: true,
      message: 'Subadmin deactivated successfully',
      data: {
        subadmin,
      },
    });
  } catch (error) {
    console.error('[subadminController] deactivateSubadmin error:', error);
    next(error);
  }
};

/**
 * Activate subadmin
 */
const activateSubadmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subadmin = await User.findById(id);

    if (!subadmin || subadmin.role !== 'ADMIN') {
      return res.status(404).json({
        success: false,
        message: 'Subadmin not found',
      });
    }

    if (subadmin.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Subadmin is already active',
      });
    }

    subadmin.isActive = true;
    await subadmin.save();

    // Create audit log
    await createAuditLog(
      'SUBADMIN_ACTIVATED',
      req.user._id,
      subadmin._id,
      {
        mobileNumber: subadmin.mobileNumber,
        name: subadmin.adminProfile.name,
      },
      'SUCCESS',
      null,
      req
    );

    res.status(200).json({
      success: true,
      message: 'Subadmin activated successfully',
      data: {
        subadmin,
      },
    });
  } catch (error) {
    console.error('[subadminController] activateSubadmin error:', error);
    next(error);
  }
};

/**
 * Get audit logs for subadmin verification
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const {
      action,
      targetUser,
      performedBy,
      status,
      page = 1,
      limit = 50,
      sort = '-createdAt',
      startDate,
      endDate,
    } = req.query;

    // Build filter object
    const filter = {};

    // Filter by action (only subadmin-related actions)
    const subadminActions = [
      'SUBADMIN_CREATED',
      'SUBADMIN_VERIFIED',
      'SUBADMIN_REJECTED',
      'SUBADMIN_UPDATED',
      'SUBADMIN_DEACTIVATED',
      'SUBADMIN_ACTIVATED',
      'SUBADMIN_PERMISSIONS_UPDATED',
    ];

    if (action) {
      if (subadminActions.includes(action)) {
        filter.action = action;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid action filter',
        });
      }
    } else {
      filter.action = { $in: subadminActions };
    }

    if (targetUser) filter.targetUser = targetUser;
    if (performedBy) filter.performedBy = performedBy;
    if (status) filter.status = status;

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const auditLogs = await AuditLog.find(filter)
      .populate('performedBy', 'adminProfile.name mobileNumber')
      .populate('targetUser', 'mobileNumber adminProfile.name adminProfile.email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AuditLog.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: auditLogs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: {
        auditLogs,
      },
    });
  } catch (error) {
    console.error('[subadminController] getAuditLogs error:', error);
    next(error);
  }
};

module.exports = {
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
};
