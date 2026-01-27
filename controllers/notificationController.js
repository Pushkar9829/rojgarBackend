const Notification = require('../models/Notification');
const Device = require('../models/Device');

/**
 * List notifications for current user (paginated).
 * GET /api/notifications?page=1&limit=20&read=false
 */
const getNotifications = async (req, res, next) => {
  try {
    console.log('[notificationController] getNotifications called');
    console.log('[notificationController] User ID:', req.user._id);
    console.log('[notificationController] Query params:', req.query);
    
    const { page = 1, limit = 20, read } = req.query;
    const skip = (Math.max(1, parseInt(page)) - 1) * Math.min(100, Math.max(1, parseInt(limit)));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const filter = { userId: req.user._id };
    if (read !== undefined) filter.read = read === 'true';

    console.log('[notificationController] Filter:', filter, 'Skip:', skip, 'Limit:', limitNum);

    const [notifications, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Notification.countDocuments(filter),
    ]);

    console.log('[notificationController] Notifications found:', notifications.length, 'Total:', total);

    res.status(200).json({
      success: true,
      data: { notifications },
      pagination: {
        page: parseInt(page) || 1,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasNext: skip + notifications.length < total,
        hasPrev: skip > 0,
      },
    });
  } catch (error) {
    console.error('[notificationController] getNotifications error:', error);
    next(error);
  }
};

/**
 * Mark a single notification as read.
 * PATCH /api/notifications/:id/read
 */
const markRead = async (req, res, next) => {
  try {
    console.log('[notificationController] markRead called');
    console.log('[notificationController] Notification ID:', req.params.id);
    console.log('[notificationController] User ID:', req.user._id);
    
    const doc = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { read: true } },
      { new: true }
    );
    if (!doc) {
      console.log('[notificationController] Notification not found:', req.params.id);
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    console.log('[notificationController] Notification marked as read:', doc._id);
    res.status(200).json({
      success: true,
      data: { notification: doc },
    });
  } catch (error) {
    console.error('[notificationController] markRead error:', error);
    next(error);
  }
};

/**
 * Mark all notifications as read for current user.
 * PATCH /api/notifications/read-all
 */
const markAllRead = async (req, res, next) => {
  try {
    console.log('[notificationController] markAllRead called');
    console.log('[notificationController] User ID:', req.user._id);
    
    const result = await Notification.updateMany(
      { userId: req.user._id, read: false },
      { $set: { read: true } }
    );
    console.log('[notificationController] Marked', result.modifiedCount, 'notifications as read');
    res.status(200).json({
      success: true,
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (error) {
    console.error('[notificationController] markAllRead error:', error);
    next(error);
  }
};

/**
 * Get unread count.
 * GET /api/notifications/unread-count
 */
const getUnreadCount = async (req, res, next) => {
  try {
    console.log('[notificationController] getUnreadCount called');
    console.log('[notificationController] User ID:', req.user._id);
    
    const count = await Notification.countDocuments({
      userId: req.user._id,
      read: false,
    });
    console.log('[notificationController] Unread count:', count);
    res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error('[notificationController] getUnreadCount error:', error);
    next(error);
  }
};

/**
 * Register device for push (FCM token).
 * POST /api/notifications/register-device
 * Body: { fcmToken, platform } or { playerId, platform } for backward compatibility
 */
const registerDevice = async (req, res, next) => {
  try {
    console.log('[notificationController] registerDevice called');
    console.log('[notificationController] User ID:', req.user._id);
    console.log('[notificationController] Device data:', {
      fcmToken: req.body.fcmToken,
      playerId: req.body.playerId,
      platform: req.body.platform,
    });
    
    const { fcmToken, playerId, platform } = req.body;
    const token = fcmToken || playerId; // Support both for migration
    
    if (!token || !platform) {
      console.log('[notificationController] Missing fcmToken/playerId or platform');
      return res.status(400).json({
        success: false,
        message: 'fcmToken (or playerId) and platform are required',
      });
    }
    if (!['android', 'ios'].includes(platform)) {
      console.log('[notificationController] Invalid platform:', platform);
      return res.status(400).json({
        success: false,
        message: 'platform must be android or ios',
      });
    }

    // Use fcmToken as primary identifier, fallback to playerId for migration
    const updateData = {
      userId: req.user._id,
      platform,
      lastActiveAt: new Date(),
    };
    
    if (fcmToken) {
      updateData.fcmToken = fcmToken;
    } else if (playerId) {
      // Migration: store old playerId temporarily
      updateData.playerId = playerId;
      updateData.fcmToken = playerId; // Use as fcmToken until migrated
    }

    const device = await Device.findOneAndUpdate(
      fcmToken ? { fcmToken } : { playerId },
      updateData,
      { upsert: true, new: true }
    );

    console.log('[notificationController] Device registered:', { id: device._id, fcmToken: device.fcmToken, platform });
    res.status(200).json({
      success: true,
      data: { device },
    });
  } catch (error) {
    console.error('[notificationController] registerDevice error:', error);
    next(error);
  }
};

/**
 * Unregister device.
 * POST /api/notifications/unregister-device
 * Body: { fcmToken } or { playerId } for backward compatibility
 */
const unregisterDevice = async (req, res, next) => {
  try {
    console.log('[notificationController] unregisterDevice called');
    console.log('[notificationController] User ID:', req.user._id);
    console.log('[notificationController] Token:', req.body.fcmToken || req.body.playerId);
    
    const { fcmToken, playerId } = req.body;
    const token = fcmToken || playerId;
    
    if (!token) {
      console.log('[notificationController] Missing fcmToken/playerId');
      return res.status(400).json({
        success: false,
        message: 'fcmToken (or playerId) is required',
      });
    }

    const query = fcmToken 
      ? { fcmToken, userId: req.user._id }
      : { $or: [{ fcmToken: playerId }, { playerId }], userId: req.user._id };
    
    const result = await Device.deleteOne(query);
    console.log('[notificationController] Device unregistered:', { deletedCount: result.deletedCount });

    res.status(200).json({
      success: true,
      message: 'Device unregistered',
    });
  } catch (error) {
    console.error('[notificationController] unregisterDevice error:', error);
    next(error);
  }
};

module.exports = {
  getNotifications,
  markRead,
  markAllRead,
  getUnreadCount,
  registerDevice,
  unregisterDevice,
};
