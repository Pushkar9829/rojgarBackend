const User = require('../models/User');
const UserPreference = require('../models/UserPreference');

/**
 * Get user profile
 */
const getProfile = async (req, res, next) => {
  try {
    console.log('[userController] getProfile called');
    console.log('[userController] User ID:', req.user._id);

    const user = await User.findById(req.user._id).select('-__v');

    if (!user) {
      console.log('[userController] User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    console.log('[userController] Profile retrieved:', {
      userId: user._id,
      mobileNumber: user.mobileNumber,
      hasProfile: !!user.profile,
      profileComplete: !!(user.profile?.fullName && user.profile?.education),
    });

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error('[userController] getProfile error:', error);
    next(error);
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res, next) => {
  try {
    console.log('[userController] updateProfile called');
    console.log('[userController] User ID:', req.user._id);
    console.log('[userController] Profile data:', {
      fullName: req.body.profile?.fullName,
      education: req.body.profile?.education,
      state: req.body.profile?.state,
      district: req.body.profile?.district,
      preferredDomains: req.body.profile?.preferredDomains,
    });

    const { profile } = req.body;

    if (!profile) {
      console.log('[userController] No profile data provided');
      return res.status(400).json({
        success: false,
        message: 'Profile data is required',
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      console.log('[userController] User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    console.log('[userController] Current profile:', {
      fullName: user.profile?.fullName,
      education: user.profile?.education,
    });

    // Update profile fields
    if (profile.fullName) user.profile.fullName = profile.fullName;
    if (profile.dateOfBirth) user.profile.dateOfBirth = profile.dateOfBirth;
    if (profile.education) user.profile.education = profile.education;
    if (profile.state) user.profile.state = profile.state;
    if (profile.district) user.profile.district = profile.district;
    if (profile.preferredDomains) user.profile.preferredDomains = profile.preferredDomains;

    await user.save();
    console.log('[userController] Profile updated successfully');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user,
      },
    });
  } catch (error) {
    console.error('[userController] updateProfile error:', error);
    next(error);
  }
};

/**
 * Get user preferences
 */
const getPreferences = async (req, res, next) => {
  try {
    console.log('[userController] getPreferences called');
    console.log('[userController] User ID:', req.user._id);

    let preferences = await UserPreference.findOne({ userId: req.user._id });

    // Create default preferences if not exists
    if (!preferences) {
      console.log('[userController] Creating default preferences');
      preferences = await UserPreference.create({
        userId: req.user._id,
      });
    } else {
      console.log('[userController] Preferences found');
    }

    res.status(200).json({
      success: true,
      data: {
        preferences,
      },
    });
  } catch (error) {
    console.error('[userController] getPreferences error:', error);
    next(error);
  }
};

/**
 * Update user preferences
 */
const updatePreferences = async (req, res, next) => {
  try {
    console.log('[userController] updatePreferences called');
    console.log('[userController] User ID:', req.user._id);
    console.log('[userController] Request body:', req.body);

    const { notificationSettings, filterPreferences, language } = req.body;

    let preferences = await UserPreference.findOne({ userId: req.user._id });

    if (!preferences) {
      console.log('[userController] Creating new preferences');
      preferences = await UserPreference.create({
        userId: req.user._id,
      });
    }

    // Update notification settings
    if (notificationSettings) {
      console.log('[userController] Updating notification settings');
      Object.assign(preferences.notificationSettings, notificationSettings);
    }

    // Update filter preferences
    if (filterPreferences) {
      console.log('[userController] Updating filter preferences');
      if (filterPreferences.defaultJobFilter !== undefined) {
        preferences.filterPreferences.defaultJobFilter = filterPreferences.defaultJobFilter;
      }
      if (filterPreferences.defaultJobType !== undefined) {
        preferences.filterPreferences.defaultJobType = filterPreferences.defaultJobType;
      }
      if (filterPreferences.preferredJobDomains !== undefined) {
        preferences.filterPreferences.preferredJobDomains = filterPreferences.preferredJobDomains;
      }
    }

    // Update language
    if (language) {
      console.log('[userController] Updating language:', language);
      preferences.language = language;
    }

    await preferences.save();
    console.log('[userController] Preferences updated successfully');

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences,
      },
    });
  } catch (error) {
    console.error('[userController] updatePreferences error:', error);
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getPreferences,
  updatePreferences,
};