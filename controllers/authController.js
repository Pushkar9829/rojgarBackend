const OTP = require('../models/OTP');
const User = require('../models/User');
const UserPreference = require('../models/UserPreference');
const generateOTP = require('../utils/generateOTP');
const sendOTP = require('../utils/sendOTP');
const { generateToken } = require('../utils/jwtToken');

/**
 * Send OTP to mobile number
 */
const sendOTPToUser = async (req, res, next) => {
  try {
    console.log('[authController] sendOTPToUser called');
    console.log('[authController] Request body:', req.body);
    
    const { mobileNumber, purpose = 'LOGIN' } = req.body;

    // Validate mobile number
    if (!mobileNumber || !/^\d{10}$/.test(mobileNumber)) {
      console.log('[authController] Invalid mobile number:', mobileNumber);
      return res.status(400).json({
        success: false,
        message: 'Valid 10-digit mobile number is required',
      });
    }

    console.log('[authController] Sending OTP to:', mobileNumber, 'Purpose:', purpose);

    // Invalidate previous unused OTPs for this mobile number
    const invalidated = await OTP.updateMany(
      { mobileNumber, isUsed: false, purpose },
      { isUsed: true }
    );
    console.log('[authController] Invalidated previous OTPs:', invalidated.modifiedCount);

    // Generate new OTP
    const otp = generateOTP(6);
    const expiresAt = new Date(Date.now() + (process.env.OTP_EXPIRE_MINUTES || 15) * 60 * 1000);
    console.log('[authController] Generated OTP:', otp, 'Expires at:', expiresAt);

    // Save OTP to database
    const otpDoc = await OTP.create({
      mobileNumber,
      otp,
      purpose,
      expiresAt,
    });
    console.log('[authController] OTP saved to database:', otpDoc._id);

    // Send OTP via SMS (or console in dev)
    const sent = await sendOTP(mobileNumber, otp);
    console.log('[authController] OTP send result:', sent);
    
    if (!sent) {
      console.error('[authController] Failed to send OTP');
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.',
      });
    }

    console.log('[authController] OTP sent successfully');
    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        mobileNumber,
        expiresAt: otpDoc.expiresAt,
      },
    });
  } catch (error) {
    console.error('[authController] sendOTPToUser error:', error);
    next(error);
  }
};

/**
 * Verify OTP and login/register user
 */
const verifyOTP = async (req, res, next) => {
  try {
    console.log('[authController] verifyOTP called');
    console.log('[authController] Request body:', {
      mobileNumber: req.body.mobileNumber,
      otp: req.body.otp ? '***' : undefined,
      hasProfile: !!req.body.profile,
    });

    const { mobileNumber, otp, profile } = req.body;

    // Validate inputs
    if (!mobileNumber || !/^\d{10}$/.test(mobileNumber)) {
      console.log('[authController] Invalid mobile number:', mobileNumber);
      return res.status(400).json({
        success: false,
        message: 'Valid 10-digit mobile number is required',
      });
    }

    if (!otp || !/^\d{4,6}$/.test(otp)) {
      console.log('[authController] Invalid OTP format');
      return res.status(400).json({
        success: false,
        message: 'Valid OTP is required',
      });
    }

    // Find valid OTP
    const otpDoc = await OTP.findOne({
      mobileNumber,
      otp,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    console.log('[authController] OTP lookup result:', {
      found: !!otpDoc,
      isUsed: otpDoc?.isUsed,
      expiresAt: otpDoc?.expiresAt,
      attempts: otpDoc?.attempts,
    });

    if (!otpDoc) {
      // Check if OTP exists but is expired or used
      const existingOTP = await OTP.findOne({ mobileNumber, otp }).sort({ createdAt: -1 });
      
      if (existingOTP && existingOTP.isUsed) {
        console.log('[authController] OTP already used');
        return res.status(400).json({
          success: false,
          message: 'OTP has already been used',
        });
      }

      if (existingOTP && existingOTP.expiresAt < new Date()) {
        console.log('[authController] OTP expired');
        return res.status(400).json({
          success: false,
          message: 'OTP has expired',
        });
      }

      // Increment attempts
      if (existingOTP) {
        existingOTP.attempts += 1;
        await existingOTP.save();
        console.log('[authController] Incremented attempts:', existingOTP.attempts);

        if (existingOTP.attempts >= 5) {
          console.log('[authController] Maximum attempts exceeded');
          return res.status(400).json({
            success: false,
            message: 'Maximum OTP attempts exceeded. Please request a new OTP',
          });
        }
      }

      console.log('[authController] Invalid OTP');
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    // Check attempts
    if (otpDoc.attempts >= 5) {
      console.log('[authController] Maximum attempts exceeded:', otpDoc.attempts);
      return res.status(400).json({
        success: false,
        message: 'Maximum OTP attempts exceeded. Please request a new OTP',
      });
    }

    // Mark OTP as used
    otpDoc.isUsed = true;
    await otpDoc.save();
    console.log('[authController] OTP marked as used');

    // Check if user exists
    let user = await User.findOne({ mobileNumber });
    console.log('[authController] User lookup:', {
      found: !!user,
      userId: user?._id,
      role: user?.role,
    });

    if (!user) {
      console.log('[authController] Creating new user');
      // Register new user
      if (otpDoc.purpose !== 'REGISTER' && !profile) {
        console.log('[authController] Registration required but no profile provided');
        return res.status(400).json({
          success: false,
          message: 'User not found. Please provide profile information for registration',
        });
      }

      // Create new user
      const userData = {
        mobileNumber,
        role: 'USER',
        profile: profile || {},
      };

      user = await User.create(userData);
      console.log('[authController] New user created:', user._id);

      // Create default user preferences
      await UserPreference.create({
        userId: user._id,
      });
      console.log('[authController] Default preferences created');
    } else {
      console.log('[authController] Existing user found');
      // Update profile if provided during login
      if (profile) {
        console.log('[authController] Updating profile');
        Object.assign(user.profile, profile);
        await user.save();
      }
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();
    console.log('[authController] Last login updated');

    // Generate JWT token
    const token = generateToken(user._id, user.role);
    console.log('[authController] Token generated');

    const response = {
      success: true,
      message: otpDoc.purpose === 'REGISTER' ? 'Registration successful' : 'Login successful',
      data: {
        token,
        user: {
          _id: user._id,
          mobileNumber: user.mobileNumber,
          role: user.role,
          profile: user.profile,
        },
      },
    };

    console.log('[authController] verifyOTP success:', {
      purpose: otpDoc.purpose,
      userId: user._id,
      hasProfile: !!user.profile?.fullName,
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('[authController] verifyOTP error:', error);
    next(error);
  }
};

/**
 * Logout user (client-side token removal, but can add token blacklist here)
 */
const logout = async (req, res, next) => {
  try {
    console.log('[authController] logout called');
    console.log('[authController] User ID:', req.user?._id);
    // In a production system, you might want to blacklist the token here
    console.log('[authController] Logout successful');
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('[authController] logout error:', error);
    next(error);
  }
};

module.exports = {
  sendOTPToUser,
  verifyOTP,
  logout,
};