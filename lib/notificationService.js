const User = require('../models/User');
const UserPreference = require('../models/UserPreference');
const Notification = require('../models/Notification');
const Device = require('../models/Device');
const { checkJobEligibility, checkSchemeEligibility } = require('../utils/eligibility');
const { getIO } = require('./socket');
const { sendPush } = require('../utils/firebase');

/**
 * Create in-app notifications for eligible users when a job is created or updated.
 * Respects UserPreference.notificationSettings.jobAlerts.
 * Emits 'notification' to each user's room.
 */
async function createNotificationsForJob(job) {
  const jobObj = job.toObject ? job.toObject() : job;
  const jobId = jobObj._id?.toString?.() || jobObj._id;

  const users = await User.find({ role: 'USER', isActive: true })
    .select('_id profile')
    .lean();

  const prefsMap = new Map();
  const prefDocs = await UserPreference.find({ userId: { $in: users.map((u) => u._id) } }).lean();
  prefDocs.forEach((p) => prefsMap.set(p.userId.toString(), p));

    const devicesMap = new Map();
    const deviceDocs = await Device.find({ userId: { $in: users.map((u) => u._id) } }).lean();
    deviceDocs.forEach((d) => {
      const k = d.userId.toString();
      if (!devicesMap.has(k)) devicesMap.set(k, []);
      // Use fcmToken, fallback to playerId for migration
      const token = d.fcmToken || d.playerId;
      if (token) devicesMap.get(k).push(token);
    });

  const io = getIO();
  let created = 0;

  for (const user of users) {
    if (!user.profile?.fullName || user.profile.education == null) continue;

    const prefs = prefsMap.get(user._id.toString());
    const jobAlerts = prefs?.notificationSettings?.jobAlerts !== false;
    if (!jobAlerts) continue;

    const { eligible } = checkJobEligibility(user, jobObj);
    if (!eligible) continue;

    const title = 'New job match';
    const body = jobObj.title || 'A job matching your profile was posted.';

    const doc = await Notification.create({
      userId: user._id,
      type: 'JOB_ALERT',
      title,
      body,
      data: { jobId },
      read: false,
    });

    const payload = {
      id: doc._id.toString(),
      type: doc.type,
      title: doc.title,
      body: doc.body,
      data: doc.data,
      createdAt: doc.createdAt,
    };
    io.to(`user:${user._id}`).emit('notification', payload);

    const pushOn = prefs?.notificationSettings?.pushNotifications !== false;
    const fcmTokens = devicesMap.get(user._id.toString()) || [];
    if (pushOn && fcmTokens.length > 0) {
      try {
        console.log(`[NotificationService] Sending push to user ${user._id} with ${fcmTokens.length} token(s)`);
        const pushRes = await sendPush(fcmTokens, title, body, {
          jobId,
          notificationId: doc._id.toString(),
        });
        if (pushRes.ok && pushRes.successCount > 0) {
          await Notification.updateOne({ _id: doc._id }, { $set: { pushSent: true } });
          console.log(`[NotificationService] ✅ Push sent successfully to user ${user._id} (${pushRes.successCount} success, ${pushRes.failureCount} failed)`);
        } else {
          console.warn(`[NotificationService] ⚠️  Push failed for user ${user._id}:`, pushRes.error || 'No successful sends');
        }
        // Log cleanup info if invalid tokens were removed
        if (pushRes.invalidTokensRemoved > 0) {
          console.log(`[NotificationService] Cleaned up ${pushRes.invalidTokensRemoved} invalid FCM token(s) for user ${user._id}`);
        }
      } catch (pushError) {
        // Don't let push notification errors break notification creation
        console.error('[NotificationService] Push notification error (non-fatal):', pushError.message);
      }
    } else {
      if (!pushOn) {
        console.log(`[NotificationService] Push notifications disabled for user ${user._id}`);
      } else if (fcmTokens.length === 0) {
        console.log(`[NotificationService] No FCM tokens found for user ${user._id}`);
      }
    }
    created++;
  }

  return created;
}

/**
 * Create in-app notifications for eligible users when a scheme is created or updated.
 * Respects UserPreference.notificationSettings.schemeAlerts.
 */
async function createNotificationsForScheme(scheme) {
  const schemeObj = scheme.toObject ? scheme.toObject() : scheme;
  const schemeId = schemeObj._id?.toString?.() || schemeObj._id;

  const users = await User.find({ role: 'USER', isActive: true })
    .select('_id profile')
    .lean();

  const prefsMap = new Map();
  const prefDocs = await UserPreference.find({ userId: { $in: users.map((u) => u._id) } }).lean();
  prefDocs.forEach((p) => prefsMap.set(p.userId.toString(), p));

    const devicesMap = new Map();
    const deviceDocs = await Device.find({ userId: { $in: users.map((u) => u._id) } }).lean();
    deviceDocs.forEach((d) => {
      const k = d.userId.toString();
      if (!devicesMap.has(k)) devicesMap.set(k, []);
      // Use fcmToken, fallback to playerId for migration
      const token = d.fcmToken || d.playerId;
      if (token) devicesMap.get(k).push(token);
    });

  const io = getIO();
  let created = 0;

  for (const user of users) {
    if (!user.profile?.fullName) continue;

    const prefs = prefsMap.get(user._id.toString());
    const schemeAlerts = prefs?.notificationSettings?.schemeAlerts !== false;
    if (!schemeAlerts) continue;

    const { eligible } = checkSchemeEligibility(user, schemeObj);
    if (!eligible) continue;

    const title = 'New scheme match';
    const body = schemeObj.name || 'A scheme matching your profile is available.';

    const doc = await Notification.create({
      userId: user._id,
      type: 'SCHEME_ALERT',
      title,
      body,
      data: { schemeId },
      read: false,
    });

    const payload = {
      id: doc._id.toString(),
      type: doc.type,
      title: doc.title,
      body: doc.body,
      data: doc.data,
      createdAt: doc.createdAt,
    };
    io.to(`user:${user._id}`).emit('notification', payload);

    const pushOn = prefs?.notificationSettings?.pushNotifications !== false;
    const fcmTokens = devicesMap.get(user._id.toString()) || [];
    if (pushOn && fcmTokens.length > 0) {
      try {
        console.log(`[NotificationService] Sending push to user ${user._id} with ${fcmTokens.length} token(s)`);
        const pushRes = await sendPush(fcmTokens, title, body, {
          schemeId,
          notificationId: doc._id.toString(),
        });
        if (pushRes.ok && pushRes.successCount > 0) {
          await Notification.updateOne({ _id: doc._id }, { $set: { pushSent: true } });
          console.log(`[NotificationService] ✅ Push sent successfully to user ${user._id} (${pushRes.successCount} success, ${pushRes.failureCount} failed)`);
        } else {
          console.warn(`[NotificationService] ⚠️  Push failed for user ${user._id}:`, pushRes.error || 'No successful sends');
        }
        // Log cleanup info if invalid tokens were removed
        if (pushRes.invalidTokensRemoved > 0) {
          console.log(`[NotificationService] Cleaned up ${pushRes.invalidTokensRemoved} invalid FCM token(s) for user ${user._id}`);
        }
      } catch (pushError) {
        // Don't let push notification errors break notification creation
        console.error('[NotificationService] Push notification error (non-fatal):', pushError.message);
      }
    } else {
      if (!pushOn) {
        console.log(`[NotificationService] Push notifications disabled for user ${user._id}`);
      } else if (fcmTokens.length === 0) {
        console.log(`[NotificationService] No FCM tokens found for user ${user._id}`);
      }
    }
    created++;
  }

  return created;
}

module.exports = {
  createNotificationsForJob,
  createNotificationsForScheme,
};
