const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      unique: true,
      match: [/^\d{10}$/, 'Mobile number must be exactly 10 digits'],
      index: true,
    },
    role: {
      type: String,
      enum: ['USER', 'ADMIN'],
      default: 'USER',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastLoginAt: Date,
    profile: {
      fullName: {
        type: String,
        required: function() {
          return this.role === 'USER';
        },
      },
      dateOfBirth: {
        type: Date,
        required: function() {
          return this.role === 'USER';
        },
      },
      age: {
        type: Number,
        min: [17, 'Age must be at least 17'],
        max: [100, 'Age must be less than 100'],
      },
      education: {
        type: String,
        enum: ['10th', '12th', 'ITI', 'Graduate'],
        required: function() {
          return this.role === 'USER';
        },
      },
      state: {
        type: String,
        required: function() {
          return this.role === 'USER';
        },
        index: true,
      },
      district: {
        type: String,
        required: function() {
          return this.role === 'USER';
        },
      },
      preferredDomains: {
        type: [String],
        enum: ['ALL', 'Police', 'Defence', 'Railway', 'Teaching', 'Health', 'Clerk', 'Technical', 'Apprentice'],
        default: ['ALL'],
        validate: {
          validator: function(v) {
            if (v.includes('ALL')) {
              return v.length === 1;
            }
            return true;
          },
          message: 'If "ALL" is selected, it must be the only element',
        },
      },
    },
    adminProfile: {
      name: {
        type: String,
        required: function() {
          return this.role === 'ADMIN';
        },
      },
      email: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
      },
      permissions: {
        type: [String],
        enum: [
          'CREATE_JOBS',
          'EDIT_JOBS',
          'DELETE_JOBS',
          'CREATE_SCHEMES',
          'EDIT_SCHEMES',
          'DELETE_SCHEMES',
          'VIEW_USERS',
          'MANAGE_ADMINS',
        ],
        default: [],
      },
      assignedStates: {
        type: [String],
        default: [],
      },
      // Subadmin verification fields
      verificationStatus: {
        type: String,
        enum: ['PENDING', 'VERIFIED', 'REJECTED'],
        default: 'PENDING',
        index: true,
      },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      verifiedAt: {
        type: Date,
      },
      rejectionReason: {
        type: String,
      },
      onboardingRequestedAt: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Calculate age before saving
userSchema.pre('save', function(next) {
  if (this.role === 'USER' && this.profile.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.profile.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    this.profile.age = age;
  }
  next();
});

// Indexes
userSchema.index({ mobileNumber: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ 'profile.state': 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ 'adminProfile.verificationStatus': 1 });
userSchema.index({ 'adminProfile.verificationStatus': 1, createdAt: -1 });

const User = mongoose.model('User', userSchema);

module.exports = User;