const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Support both playerId (OneSignal) and fcmToken (Firebase) for migration
    playerId: {
      type: String,
      required: false,
      unique: false,
      trim: true,
      index: true,
      sparse: true,
    },
    fcmToken: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    platform: {
      type: String,
      enum: ['android', 'ios'],
      required: true,
      index: true,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

deviceSchema.index({ userId: 1, fcmToken: 1 });

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;
