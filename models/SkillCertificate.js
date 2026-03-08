const mongoose = require('mongoose');

const skillCertificateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Skill/Certificate name is required'],
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

skillCertificateSchema.index({ isActive: 1, order: 1 });

const SkillCertificate = mongoose.model('SkillCertificate', skillCertificateSchema);
module.exports = SkillCertificate;
