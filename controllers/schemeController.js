const Scheme = require('../models/Scheme');
const User = require('../models/User');
const { checkSchemeEligibility } = require('../utils/eligibility');

/**
 * Get all schemes with filters
 */
const getSchemes = async (req, res, next) => {
  try {
    console.log('[schemeController] getSchemes called');
    console.log('[schemeController] Query params:', req.query);
    
    const {
      type,
      target,
      benefit,
      state,
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

    if (type) filter.type = type;
    if (target) filter.target = target;
    if (benefit) filter.benefit = benefit;
    if (state) filter.state = state;
    if (ageMin) filter.ageMin = { $lte: parseInt(ageMin) };
    if (ageMax) filter.ageMax = { $gte: parseInt(ageMax) };
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';

    console.log('[schemeController] Filter object:', JSON.stringify(filter, null, 2));

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    console.log('[schemeController] Pagination:', { page, limit, skip });

    const schemes = await Scheme.find(filter)
      .populate('createdBy', 'mobileNumber adminProfile.name')
      .populate('updatedBy', 'mobileNumber adminProfile.name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    console.log('[schemeController] Schemes found:', schemes.length);

    const total = await Scheme.countDocuments(filter);
    console.log('[schemeController] Total schemes:', total);

    const response = {
      success: true,
      count: schemes.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: {
        schemes,
      },
    };

    console.log('[schemeController] Response:', {
      success: response.success,
      count: response.count,
      total: response.total,
      page: response.page,
      pages: response.pages,
      schemesCount: response.data.schemes.length,
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('[schemeController] getSchemes error:', error);
    next(error);
  }
};

/**
 * Get scheme by ID
 */
const getSchemeById = async (req, res, next) => {
  try {
    console.log('[schemeController] getSchemeById called');
    console.log('[schemeController] Scheme ID:', req.params.id);

    const scheme = await Scheme.findById(req.params.id)
      .populate('createdBy', 'mobileNumber adminProfile.name')
      .populate('updatedBy', 'mobileNumber adminProfile.name');

    if (!scheme) {
      console.log('[schemeController] Scheme not found for ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Scheme not found',
      });
    }

    console.log('[schemeController] Scheme found:', {
      id: scheme._id,
      title: scheme.title,
      category: scheme.category,
    });

    res.status(200).json({
      success: true,
      data: {
        scheme,
      },
    });
  } catch (error) {
    console.error('[schemeController] getSchemeById error:', error);
    next(error);
  }
};

/**
 * Get eligible schemes for logged-in user
 */
const getEligibleSchemes = async (req, res, next) => {
  try {
    console.log('[schemeController] getEligibleSchemes called');
    console.log('[schemeController] User ID:', req.user._id);
    console.log('[schemeController] Query params:', req.query);

    const user = await User.findById(req.user._id);
    
    if (!user || user.role !== 'USER') {
      console.log('[schemeController] Access denied - not a USER:', { 
        userExists: !!user, 
        role: user?.role 
      });
      return res.status(403).json({
        success: false,
        message: 'Only regular users can access eligible schemes',
      });
    }

    if (!user.profile || !user.profile.fullName) {
      console.log('[schemeController] Profile incomplete:', {
        hasProfile: !!user.profile,
        hasFullName: !!user.profile?.fullName,
      });
      return res.status(400).json({
        success: false,
        message: 'Please complete your profile to see eligible schemes',
      });
    }

    console.log('[schemeController] User profile:', {
      fullName: user.profile.fullName,
      education: user.profile.education,
      state: user.profile.state,
      age: user.profile.age,
    });

    const {
      type,
      benefit,
      page = 1,
      limit = 20,
      sort = '-createdAt',
    } = req.query;

    // Build base filter
    const filter = {
      isActive: true,
    };

    if (type) filter.type = type;
    if (benefit) filter.benefit = benefit;

    console.log('[schemeController] Filter for eligible schemes:', JSON.stringify(filter, null, 2));

    // Get all schemes matching basic filters
    const allSchemes = await Scheme.find(filter)
      .populate('createdBy', 'mobileNumber adminProfile.name')
      .sort(sort);

    console.log('[schemeController] All schemes matching filter:', allSchemes.length);

    // Filter eligible schemes
    const eligibleSchemes = allSchemes.filter((scheme) => {
      const eligibility = checkSchemeEligibility(user, scheme);
      return eligibility.eligible;
    });

    console.log('[schemeController] Eligible schemes after filtering:', eligibleSchemes.length);

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedSchemes = eligibleSchemes.slice(skip, skip + parseInt(limit));

    console.log('[schemeController] Pagination:', {
      page,
      limit,
      skip,
      totalEligible: eligibleSchemes.length,
      paginatedCount: paginatedSchemes.length,
    });

    // Add eligibility info to each scheme
    const schemesWithEligibility = paginatedSchemes.map((scheme) => {
      const eligibility = checkSchemeEligibility(user, scheme);
      return {
        ...scheme.toObject(),
        eligibility: {
          eligible: eligibility.eligible,
          reasons: eligibility.reasons,
        },
      };
    });

    const response = {
      success: true,
      count: schemesWithEligibility.length,
      total: eligibleSchemes.length,
      page: parseInt(page),
      pages: Math.ceil(eligibleSchemes.length / parseInt(limit)),
      data: {
        schemes: schemesWithEligibility,
      },
    };

    console.log('[schemeController] Eligible schemes response:', {
      success: response.success,
      count: response.count,
      total: response.total,
      page: response.page,
      pages: response.pages,
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('[schemeController] getEligibleSchemes error:', error);
    next(error);
  }
};

module.exports = {
  getSchemes,
  getSchemeById,
  getEligibleSchemes,
};