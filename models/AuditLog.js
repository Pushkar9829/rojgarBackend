const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'SUBADMIN_CREATED',
        'SUBADMIN_VERIFIED',
        'SUBADMIN_REJECTED',
        'SUBADMIN_UPDATED',
        'SUBADMIN_DEACTIVATED',
        'SUBADMIN_ACTIVATED',
        'SUBADMIN_PERMISSIONS_UPDATED',
      ],
      index: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED'],
      default: 'SUCCESS',
      index: true,
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ targetUser: 1, createdAt: -1 });
auditLogSchema.index({ performedBy: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, targetUser: 1, createdAt: -1 });

// Virtual for readable action description
auditLogSchema.virtual('actionDescription').get(function() {
  const descriptions = {
    SUBADMIN_CREATED: 'Subadmin onboarding request created',
    SUBADMIN_VERIFIED: 'Subadmin verified and activated',
    SUBADMIN_REJECTED: 'Subadmin verification rejected',
    SUBADMIN_UPDATED: 'Subadmin profile updated',
    SUBADMIN_DEACTIVATED: 'Subadmin deactivated',
    SUBADMIN_ACTIVATED: 'Subadmin activated',
    SUBADMIN_PERMISSIONS_UPDATED: 'Subadmin permissions updated',
  };
  return descriptions[this.action] || this.action;
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
