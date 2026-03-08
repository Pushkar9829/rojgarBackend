const mongoose = require('mongoose');

const qualificationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Qualification name is required'],
      trim: true,
      unique: true,
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

qualificationSchema.index({ isActive: 1, order: 1 });

const Qualification = mongoose.model('Qualification', qualificationSchema);
module.exports = Qualification;
