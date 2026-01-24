const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Scheme name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['CENTRAL', 'STATE'],
      required: [true, 'Scheme type is required'],
      index: true,
    },
    target: {
      type: String,
      required: [true, 'Target audience is required'],
      trim: true,
      index: true,
    },
    benefit: {
      type: String,
      enum: ['Money', 'Training', 'Subsidy'],
      required: [true, 'Benefit type is required'],
      index: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      index: true,
    },
    ageMin: {
      type: Number,
      min: [0, 'Minimum age cannot be negative'],
      index: true,
    },
    ageMax: {
      type: Number,
      min: [0, 'Maximum age cannot be negative'],
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
    eligibilityCriteria: {
      type: String,
      trim: true,
    },
    documentsRequired: [String],
    benefitAmount: {
      amount: {
        type: Number,
        min: [0, 'Benefit amount cannot be negative'],
      },
      currency: {
        type: String,
        default: 'INR',
      },
      type: {
        type: String,
        enum: ['Fixed', 'Variable'],
      },
    },
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

// Validation: if ageMin is provided, ageMax should also be provided (and vice versa)
schemeSchema.pre('validate', function(next) {
  if ((this.ageMin !== undefined && this.ageMin !== null) !== (this.ageMax !== undefined && this.ageMax !== null)) {
    next(new Error('Both ageMin and ageMax must be provided together'));
  } else if (this.ageMin !== undefined && this.ageMax !== undefined && this.ageMin >= this.ageMax) {
    next(new Error('Minimum age must be less than maximum age'));
  } else {
    next();
  }
});

// Indexes
schemeSchema.index({ type: 1 });
schemeSchema.index({ target: 1 });
schemeSchema.index({ benefit: 1 });
schemeSchema.index({ state: 1 });
schemeSchema.index({ ageMin: 1 });
schemeSchema.index({ ageMax: 1 });
schemeSchema.index({ isActive: 1 });
schemeSchema.index({ isFeatured: 1 });
schemeSchema.index({ createdAt: -1 });
schemeSchema.index({ createdBy: 1 });

const Scheme = mongoose.model('Scheme', schemeSchema);

module.exports = Scheme;