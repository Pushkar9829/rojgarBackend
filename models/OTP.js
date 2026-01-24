const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      match: [/^\d{10}$/, 'Mobile number must be exactly 10 digits'],
      index: true,
    },
    otp: {
      type: String,
      required: [true, 'OTP is required'],
      match: [/^\d{4,6}$/, 'OTP must be 4-6 digits'],
    },
    purpose: {
      type: String,
      enum: ['LOGIN', 'REGISTER', 'PASSWORD_RESET'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // TTL index
    },
    attempts: {
      type: Number,
      default: 0,
      max: [5, 'Maximum 5 attempts allowed'],
    },
    isUsed: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
otpSchema.index({ mobileNumber: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ isUsed: 1 });

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;