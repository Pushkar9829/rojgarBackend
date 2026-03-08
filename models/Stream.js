const mongoose = require('mongoose');

const streamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Stream name is required'],
      trim: true,
    },
    qualificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Qualification',
      default: null,
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

streamSchema.index({ isActive: 1, order: 1 });
streamSchema.index({ qualificationId: 1, isActive: 1 });

const Stream = mongoose.model('Stream', streamSchema);
module.exports = Stream;
