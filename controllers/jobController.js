const Job = require('../models/Job');
const User = require('../models/User');
const { checkJobEligibility } = require('../utils/eligibility');

/**
 * Get all jobs with filters
 */
const getJobs = async (req, res, next) => {
  try {
    console.log('[jobController] getJobs called');
    console.log('[jobController] Query params:', req.query);
    
    const {
      jobType,
      domain,
      state,
      education,
      ageMin,
      ageMax,
      isActive,
      isFeatured,
      page = 1,
      limit = 20,
      sort = '-createdAt',
    } = req.query;

    // Build filter object
    const filter = {};

    if (jobType) filter.jobType = jobType;
    if (domain) filter.domain = domain;
    if (state) filter.state = state;
    if (education) filter.education = education;
    if (ageMin) filter.ageMin = { $lte: parseInt(ageMin) };
    if (ageMax) filter.ageMax = { $gte: parseInt(ageMax) };
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';

    console.log('[jobController] Filter object:', JSON.stringify(filter, null, 2));

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    console.log('[jobController] Pagination:', { page, limit, skip });

    const jobs = await Job.find(filter)
      .populate('createdBy', 'mobileNumber adminProfile.name')
      .populate('updatedBy', 'mobileNumber adminProfile.name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    console.log('[jobController] Jobs found:', jobs.length);

    const total = await Job.countDocuments(filter);
    console.log('[jobController] Total jobs:', total);

    const response = {
      success: true,
      count: jobs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: {
        jobs,
      },
    };

    console.log('[jobController] Response:', {
      success: response.success,
      count: response.count,
      total: response.total,
      page: response.page,
      pages: response.pages,
      jobsCount: response.data.jobs.length,
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('[jobController] getJobs error:', error);
    next(error);
  }
};

/**
 * Get job by ID
 */
const getJobById = async (req, res, next) => {
  try {
    console.log('[jobController] getJobById called');
    console.log('[jobController] Job ID:', req.params.id);

    const job = await Job.findById(req.params.id)
      .populate('createdBy', 'mobileNumber adminProfile.name')
      .populate('updatedBy', 'mobileNumber adminProfile.name');

    if (!job) {
      console.log('[jobController] Job not found for ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    console.log('[jobController] Job found:', {
      id: job._id,
      title: job.title,
      domain: job.domain,
    });

    res.status(200).json({
      success: true,
      data: {
        job,
      },
    });
  } catch (error) {
    console.error('[jobController] getJobById error:', error);
    next(error);
  }
};

/**
 * Get eligible jobs for logged-in user
 */
const getEligibleJobs = async (req, res, next) => {
  try {
    console.log('[jobController] getEligibleJobs called');
    console.log('[jobController] User ID:', req.user._id);
    console.log('[jobController] Query params:', req.query);

    const user = await User.findById(req.user._id);
    
    if (!user || user.role !== 'USER') {
      console.log('[jobController] Access denied - not a USER:', { 
        userExists: !!user, 
        role: user?.role 
      });
      return res.status(403).json({
        success: false,
        message: 'Only regular users can access eligible jobs',
      });
    }

    if (!user.profile || !user.profile.fullName) {
      console.log('[jobController] Profile incomplete:', {
        hasProfile: !!user.profile,
        hasFullName: !!user.profile?.fullName,
      });
      return res.status(400).json({
        success: false,
        message: 'Please complete your profile to see eligible jobs',
      });
    }

    console.log('[jobController] User profile:', {
      fullName: user.profile.fullName,
      education: user.profile.education,
      state: user.profile.state,
      age: user.profile.age,
    });

    const {
      jobType,
      domain,
      page = 1,
      limit = 20,
      sort = '-createdAt',
    } = req.query;

    // Build base filter
    const filter = {
      isActive: true,
      lastDate: { $gte: new Date() }, // Only active jobs with future last date
    };

    if (jobType) filter.jobType = jobType;
    if (domain) filter.domain = domain;

    console.log('[jobController] Filter for eligible jobs:', JSON.stringify(filter, null, 2));

    // Get all jobs matching basic filters
    const allJobs = await Job.find(filter)
      .populate('createdBy', 'mobileNumber adminProfile.name')
      .sort(sort);

    console.log('[jobController] All jobs matching filter:', allJobs.length);

    // Filter eligible jobs
    const eligibleJobs = allJobs.filter((job) => {
      const eligibility = checkJobEligibility(user, job);
      return eligibility.eligible;
    });

    console.log('[jobController] Eligible jobs after filtering:', eligibleJobs.length);

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedJobs = eligibleJobs.slice(skip, skip + parseInt(limit));

    console.log('[jobController] Pagination:', {
      page,
      limit,
      skip,
      totalEligible: eligibleJobs.length,
      paginatedCount: paginatedJobs.length,
    });

    // Add eligibility info to each job
    const jobsWithEligibility = paginatedJobs.map((job) => {
      const eligibility = checkJobEligibility(user, job);
      return {
        ...job.toObject(),
        eligibility: {
          eligible: eligibility.eligible,
          reasons: eligibility.reasons,
        },
      };
    });

    const response = {
      success: true,
      count: jobsWithEligibility.length,
      total: eligibleJobs.length,
      page: parseInt(page),
      pages: Math.ceil(eligibleJobs.length / parseInt(limit)),
      data: {
        jobs: jobsWithEligibility,
      },
    };

    console.log('[jobController] Eligible jobs response:', {
      success: response.success,
      count: response.count,
      total: response.total,
      page: response.page,
      pages: response.pages,
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('[jobController] getEligibleJobs error:', error);
    next(error);
  }
};

module.exports = {
  getJobs,
  getJobById,
  getEligibleJobs,
};