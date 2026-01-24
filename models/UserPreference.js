const mongoose = require('mongoose');

const userPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    notificationSettings: {
      jobAlerts: {
        type: Boolean,
        default: true,
      },
      schemeAlerts: {
        type: Boolean,
        default: true,
      },
      reminders: {
        type: Boolean,
        default: true,
      },
      pushNotifications: {
        type: Boolean,
        default: true,
      },
      emailNotifications: {
        type: Boolean,
        default: false,
      },
      smsNotifications: {
        type: Boolean,
        default: false,
      },
    },
    filterPreferences: {
      defaultJobFilter: {
        type: String,
        enum: ['ALL', 'CENTRAL', 'STATE', 'YOUR_DOMAINS'],
        default: 'ALL',
      },
      defaultJobType: {
        type: String,
        enum: ['CENTRAL', 'STATE', null],
        default: null,
      },
      preferredJobDomains: {
        type: [String],
        default: [],
      },
    },
    language: {
      type: String,
      enum: ['en', 'hi'],
      default: 'en',
    },
  },
  {
    timestamps: true,
  }
);

const UserPreference = mongoose.model('UserPreference', userPreferenceSchema);

module.exports = UserPreference;