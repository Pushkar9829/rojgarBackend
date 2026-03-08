const mongoose = require('mongoose');

const jobTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Job type name is required'],
      trim: true,
      unique: true,
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
      index: true,
    },
    requiresHeight: {
      type: Boolean,
      default: false,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

jobTypeSchema.index({ isActive: 1, order: 1 });

const JobType = mongoose.model('JobType', jobTypeSchema);
module.exports = JobType;
