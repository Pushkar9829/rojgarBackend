const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    jobType: {
      type: String,
      enum: ['CENTRAL', 'STATE'],
      required: [true, 'Job type is required'],
      index: true,
    },
    domain: {
      type: String,
      enum: ['Police', 'Defence', 'Railway', 'Teaching', 'Health', 'Clerk', 'Technical', 'Apprentice'],
      required: [true, 'Domain is required'],
      index: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      index: true,
    },
    education: {
      type: String,
      enum: ['10th', '12th', 'ITI', 'Graduate'],
      required: [true, 'Education requirement is required'],
      index: true,
    },
    ageMin: {
      type: Number,
      required: [true, 'Minimum age is required'],
      min: [17, 'Minimum age must be at least 17'],
      index: true,
    },
    ageMax: {
      type: Number,
      required: [true, 'Maximum age is required'],
      max: [60, 'Maximum age must be at most 60'],
      index: true,
    },
    lastDate: {
      type: Date,
      required: [true, 'Last date is required'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    applicationLink: {
      type: String,
      trim: true,
    },
    vacancyCount: {
      type: Number,
      min: [0, 'Vacancy count cannot be negative'],
    },
    salaryRange: {
      min: {
        type: Number,
        min: [0, 'Minimum salary cannot be negative'],
      },
      max: {
        type: Number,
        min: [0, 'Maximum salary cannot be negative'],
      },
      currency: {
        type: String,
        default: 'INR',
      },
    },
    requirements: [String],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Validation: ageMin < ageMax
jobSchema.pre('validate', function(next) {
  if (this.ageMin >= this.ageMax) {
    next(new Error('Minimum age must be less than maximum age'));
  } else {
    next();
  }
});

// Validation: lastDate must be in future when created
jobSchema.pre('save', function(next) {
  if (this.isNew && this.lastDate < new Date()) {
    next(new Error('Last date must be in the future'));
  } else {
    next();
  }
});

// Indexes
jobSchema.index({ jobType: 1 });
jobSchema.index({ domain: 1 });
jobSchema.index({ state: 1 });
jobSchema.index({ education: 1 });
jobSchema.index({ ageMin: 1 });
jobSchema.index({ ageMax: 1 });
jobSchema.index({ lastDate: 1 });
jobSchema.index({ isActive: 1 });
jobSchema.index({ isFeatured: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ createdBy: 1 });

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;