const Job = require('../models/Job');
const Scheme = require('../models/Scheme');
const User = require('../models/User');
const { getIO } = require('../lib/socket');
const {
  createNotificationsForJob,
  createNotificationsForScheme,
} = require('../lib/notificationService');

/**
 * Create a new job
 */
const createJob = async (req, res, next) => {
  try {
    console.log('[adminController] createJob called');
    console.log('[adminController] Admin ID:', req.user._id);
    console.log('[adminController] Job data:', {
      title: req.body.title,
      jobType: req.body.jobType,
      domain: req.body.domain,
      state: req.body.state,
    });

    const jobData = {
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    };

    const job = await Job.create(jobData);
    console.log('[adminController] Job created:', { id: job._id, title: job.title });
    try {
      getIO().to('admin').emit('job:created', { job: job.toObject ? job.toObject() : job });
    } catch (e) {
      /* ignore */
    }
    try {
      const notifCount = await createNotificationsForJob(job);
      console.log('[adminController] Notifications created for job:', notifCount);
    } catch (e) {
      console.error('[adminController] createNotificationsForJob error:', e);
    }

    console.log('[adminController] createJob completed successfully');
    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: {
        job,
      },
    });
  } catch (error) {
    console.error('[adminController] createJob error:', error);
    next(error);
  }
};

/**
 * Update a job
 */
const updateJob = async (req, res, next) => {
  try {
    console.log('[adminController] updateJob called');
    console.log('[adminController] Job ID:', req.params.id);
    console.log('[adminController] Admin ID:', req.user._id);
    console.log('[adminController] Update data:', Object.keys(req.body));

    let job = await Job.findById(req.params.id);

    if (!job) {
      console.log('[adminController] Job not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }
    console.log('[adminController] Job found:', { id: job._id, title: job.title });

    // Update job fields
    Object.keys(req.body).forEach((key) => {
      if (key !== 'createdBy' && key !== 'createdAt') {
        job[key] = req.body[key];
      }
    });

    job.updatedBy = req.user._id;
    await job.save();
    console.log('[adminController] Job updated:', { id: job._id, title: job.title });
    try {
      getIO().to('admin').emit('job:updated', { job: job.toObject ? job.toObject() : job });
      console.log('[adminController] Emitted job:updated event');
    } catch (e) {
      console.error('[adminController] Socket emit error:', e);
    }
    try {
      const notifCount = await createNotificationsForJob(job);
      console.log('[adminController] Notifications created for updated job:', notifCount);
    } catch (e) {
      console.error('[adminController] createNotificationsForJob error:', e);
    }

    console.log('[adminController] updateJob completed successfully');
    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: {
        job,
      },
    });
  } catch (error) {
    console.error('[adminController] updateJob error:', error);
    next(error);
  }
};

/**
 * Delete a job
 */
const deleteJob = async (req, res, next) => {
  try {
    console.log('[adminController] deleteJob called');
    console.log('[adminController] Job ID:', req.params.id);
    console.log('[adminController] Admin ID:', req.user._id);

    const job = await Job.findById(req.params.id);

    if (!job) {
      console.log('[adminController] Job not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }
    console.log('[adminController] Job found:', { id: job._id, title: job.title });

    const jobId = job._id.toString();
    await job.deleteOne();
    try {
      getIO().to('admin').emit('job:deleted', { jobId });
    } catch (e) {
      /* ignore */
    }

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new scheme
 */
const createScheme = async (req, res, next) => {
  try {
    const schemeData = {
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    };

    const scheme = await Scheme.create(schemeData);
    try {
      getIO().to('admin').emit('scheme:created', { scheme: scheme.toObject ? scheme.toObject() : scheme });
    } catch (e) {
      /* ignore */
    }
    try {
      await createNotificationsForScheme(scheme);
    } catch (e) {
      if (process.env.NODE_ENV === 'development') console.error('[admin] createNotificationsForScheme:', e);
    }

    res.status(201).json({
      success: true,
      message: 'Scheme created successfully',
      data: {
        scheme,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a scheme
 */
const updateScheme = async (req, res, next) => {
  try {
    let scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found',
      });
    }

    // Update scheme fields
    Object.keys(req.body).forEach((key) => {
      if (key !== 'createdBy' && key !== 'createdAt') {
        scheme[key] = req.body[key];
      }
    });

    scheme.updatedBy = req.user._id;
    await scheme.save();
    try {
      getIO().to('admin').emit('scheme:updated', { scheme: scheme.toObject ? scheme.toObject() : scheme });
    } catch (e) {
      /* ignore */
    }
    try {
      await createNotificationsForScheme(scheme);
    } catch (e) {
      if (process.env.NODE_ENV === 'development') console.error('[admin] createNotificationsForScheme:', e);
    }

    res.status(200).json({
      success: true,
      message: 'Scheme updated successfully',
      data: {
        scheme,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a scheme
 */
const deleteScheme = async (req, res, next) => {
  try {
    const scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found',
      });
    }

    const schemeId = scheme._id.toString();
    await scheme.deleteOne();
    try {
      getIO().to('admin').emit('scheme:deleted', { schemeId });
    } catch (e) {
      /* ignore */
    }

    res.status(200).json({
      success: true,
      message: 'Scheme deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get users list with filters
 */
const getUsers = async (req, res, next) => {
  try {
    console.log('[adminController] getUsers called');
    console.log('[adminController] Query params:', req.query);
    
    const {
      role,
      state,
      isActive,
      page = 1,
      limit = 20,
      sort = '-createdAt',
    } = req.query;

    // Build filter object
    const filter = {};

    if (role) filter.role = role;
    if (state) filter['profile.state'] = state;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    // For SUBADMIN, filter by assigned states (only for USER role)
    if (req.user.role === 'SUBADMIN' && req.user.adminProfile?.assignedStates?.length > 0) {
      const assignedStates = req.user.adminProfile.assignedStates;
      // Only apply state filter for USER role, not for ADMIN/SUBADMIN roles
      if (!role || role === 'USER') {
        filter['profile.state'] = assignedStates.includes(state) 
          ? state 
          : { $in: assignedStates };
      }
    }

    console.log('[adminController] Filter:', filter);
    console.log('[adminController] User Role:', req.user.role);

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filter)
      .select('-__v')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    console.log('[adminController] Users found:', users.length, 'Total:', total);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: {
        users,
      },
    });
  } catch (error) {
    console.error('[adminController] getUsers error:', error);
    next(error);
  }
};

/**
 * Get dashboard statistics
 */
const getStats = async (req, res, next) => {
  try {
    console.log('[adminController] getStats called');
    console.log('[adminController] User ID:', req.user._id);
    console.log('[adminController] User Role:', req.user.role);

    // Build filters based on user role
    const userFilter = { role: 'USER' };
    const jobFilter = {};
    const schemeFilter = {};
    const adminFilter = { role: 'ADMIN' };

    // For SUBADMIN, filter by assigned states
    if (req.user.role === 'SUBADMIN' && req.user.adminProfile?.assignedStates?.length > 0) {
      const assignedStates = req.user.adminProfile.assignedStates;
      // Filter users by assigned states
      userFilter['profile.state'] = { $in: assignedStates };
      // Filter jobs: include CENTRAL jobs and STATE jobs in assigned states
      jobFilter.$or = [
        { jobType: 'CENTRAL' },
        { jobType: 'STATE', state: { $in: assignedStates } }
      ];
      // Filter schemes: include CENTRAL schemes and STATE schemes in assigned states
      schemeFilter.$or = [
        { type: 'CENTRAL' },
        { type: 'STATE', state: { $in: assignedStates } }
      ];
    }

    const totalUsers = await User.countDocuments(userFilter);
    const activeUsers = await User.countDocuments({ ...userFilter, isActive: true });
    
    // For ADMIN, return both admins and subadmins separately
    let totalAdmins, totalSubadmins;
    if (req.user.role === 'ADMIN') {
      totalAdmins = await User.countDocuments({ role: 'ADMIN' });
      totalSubadmins = await User.countDocuments({ role: 'SUBADMIN' });
    } else {
      // For SUBADMIN, only return subadmin count
      totalAdmins = 0;
      totalSubadmins = await User.countDocuments({ role: 'SUBADMIN' });
    }

    const totalJobs = Object.keys(jobFilter).length > 0 
      ? await Job.countDocuments(jobFilter)
      : await Job.countDocuments();
    const activeJobs = Object.keys(jobFilter).length > 0
      ? await Job.countDocuments({ ...jobFilter, isActive: true })
      : await Job.countDocuments({ isActive: true });
    const featuredJobs = Object.keys(jobFilter).length > 0
      ? await Job.countDocuments({ ...jobFilter, isFeatured: true })
      : await Job.countDocuments({ isFeatured: true });

    const totalSchemes = Object.keys(schemeFilter).length > 0
      ? await Scheme.countDocuments(schemeFilter)
      : await Scheme.countDocuments();
    const activeSchemes = Object.keys(schemeFilter).length > 0
      ? await Scheme.countDocuments({ ...schemeFilter, isActive: true })
      : await Scheme.countDocuments({ isActive: true });
    const featuredSchemes = Object.keys(schemeFilter).length > 0
      ? await Scheme.countDocuments({ ...schemeFilter, isFeatured: true })
      : await Scheme.countDocuments({ isFeatured: true });

    // Jobs by type
    const centralJobFilter = Object.keys(jobFilter).length > 0
      ? { ...jobFilter, jobType: 'CENTRAL' }
      : { jobType: 'CENTRAL' };
    const stateJobFilter = Object.keys(jobFilter).length > 0
      ? { ...jobFilter, jobType: 'STATE' }
      : { jobType: 'STATE' };
    const centralJobs = await Job.countDocuments(centralJobFilter);
    const stateJobs = await Job.countDocuments(stateJobFilter);

    // Schemes by type
    const centralSchemeFilter = Object.keys(schemeFilter).length > 0
      ? { ...schemeFilter, type: 'CENTRAL' }
      : { type: 'CENTRAL' };
    const stateSchemeFilter = Object.keys(schemeFilter).length > 0
      ? { ...schemeFilter, type: 'STATE' }
      : { type: 'STATE' };
    const centralSchemes = await Scheme.countDocuments(centralSchemeFilter);
    const stateSchemes = await Scheme.countDocuments(stateSchemeFilter);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentJobFilter = Object.keys(jobFilter).length > 0
      ? { ...jobFilter, createdAt: { $gte: sevenDaysAgo } }
      : { createdAt: { $gte: sevenDaysAgo } };
    const recentSchemeFilter = Object.keys(schemeFilter).length > 0
      ? { ...schemeFilter, createdAt: { $gte: sevenDaysAgo } }
      : { createdAt: { $gte: sevenDaysAgo } };
    const recentUserFilter = { ...userFilter, createdAt: { $gte: sevenDaysAgo } };
    
    const recentJobs = await Job.countDocuments(recentJobFilter);
    const recentSchemes = await Scheme.countDocuments(recentSchemeFilter);
    const recentUsers = await User.countDocuments(recentUserFilter);

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        admins: totalAdmins,
        subadmins: totalSubadmins,
      },
      jobs: {
        total: totalJobs,
        active: activeJobs,
        featured: featuredJobs,
        central: centralJobs,
        state: stateJobs,
      },
      schemes: {
        total: totalSchemes,
        active: activeSchemes,
        featured: featuredSchemes,
        central: centralSchemes,
        state: stateSchemes,
      },
      recent: {
        jobs: recentJobs,
        schemes: recentSchemes,
        users: recentUsers,
      },
    };

    console.log('[adminController] Stats calculated:', {
      totalUsers,
      totalJobs,
      totalSchemes,
      recentJobs,
      recentSchemes,
      recentUsers,
    });

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('[adminController] getStats error:', error);
    next(error);
  }
};

module.exports = {
  createJob,
  updateJob,
  deleteJob,
  createScheme,
  updateScheme,
  deleteScheme,
  getUsers,
  getStats,
};