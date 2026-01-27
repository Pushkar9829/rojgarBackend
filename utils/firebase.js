const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let firebaseApp = null;

/**
 * Initialize Firebase Admin SDK
 * Requires: FIREBASE_SERVICE_ACCOUNT (path to service account JSON) or
 *           FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env
 */
function initializeFirebase() {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // Option 1: Use service account file path
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      // Resolve path relative to backend directory
      const serviceAccountPath = path.isAbsolute(process.env.FIREBASE_SERVICE_ACCOUNT)
        ? process.env.FIREBASE_SERVICE_ACCOUNT
        : path.join(__dirname, '..', process.env.FIREBASE_SERVICE_ACCOUNT);
      
      // Check if file exists
      if (!fs.existsSync(serviceAccountPath)) {
        console.error('[Firebase] Service account file not found:', serviceAccountPath);
        return null;
      }
      
      const serviceAccount = require(serviceAccountPath);
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('[Firebase] Initialized with service account file:', serviceAccountPath);
      return firebaseApp;
    }

    // Option 2: Use environment variables
    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      // Replace escaped newlines in private key
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
      console.log('[Firebase] Initialized with environment variables');
      return firebaseApp;
    }

    console.warn(
      '[Firebase] Firebase not configured. Set FIREBASE_SERVICE_ACCOUNT or FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY'
    );
    return null;
  } catch (error) {
    console.error('[Firebase] Initialization error:', error.message);
    return null;
  }
}

/**
 * Send push notification via Firebase Cloud Messaging
 * @param {string[]} fcmTokens - Array of FCM registration tokens
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Custom data { jobId?, schemeId?, notificationId? }
 * @returns {Promise<{ ok: boolean, successCount?: number, failureCount?: number, error?: string }>}
 */
async function sendPush(fcmTokens, title, body, data = {}) {
  if (!firebaseApp) {
    initializeFirebase();
  }

  if (!firebaseApp) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Firebase] Firebase not initialized. Skip push.');
    }
    return { ok: false, error: 'Firebase not configured' };
  }

  if (!fcmTokens || fcmTokens.length === 0) {
    return { ok: false, error: 'No FCM tokens' };
  }

  // Prepare notification payload
  const message = {
    notification: {
      title: title || 'RojgaAlert',
      body: body || ' ',
    },
    data: {
      ...data,
      // Convert all data values to strings (FCM requirement)
      ...Object.keys(data).reduce((acc, key) => {
        acc[key] = String(data[key] || '');
        return acc;
      }, {}),
    },
    // Android specific options
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
        channelId: 'rojgaalert_default',
        tag: 'rojgaalert',
        // Remove clickAction for React Native - it's handled automatically
        // icon: 'ic_notification', // Optional: ensure this icon exists in android/app/src/main/res/drawable
      },
    },
    // iOS specific options
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
          alert: {
            title: title || 'RojgaAlert',
            body: body || ' ',
          },
        },
      },
    },
  };

  // Log message details for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('[Firebase] Sending push notification:', {
      title: message.notification.title,
      body: message.notification.body,
      dataKeys: Object.keys(message.data),
      tokenCount: fcmTokens.length,
    });
  }

  try {
    // Send to multiple tokens
    const response = await admin.messaging().sendEachForMulticast({
      ...message,
      tokens: fcmTokens,
    });

    // Track invalid tokens that need to be removed
    const invalidTokens = [];
    const otherFailedTokens = [];

    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const token = fcmTokens[idx];
          const errorCode = resp.error?.code;
          
          // Check for invalid token error codes
          if (
            errorCode === 'messaging/registration-token-not-registered' ||
            errorCode === 'messaging/invalid-registration-token' ||
            errorCode === 'messaging/invalid-argument'
          ) {
            invalidTokens.push(token);
            console.warn(`[Firebase] Invalid token detected (${errorCode}): ${token.substring(0, 20)}...`);
          } else {
            otherFailedTokens.push({ token, error: resp.error });
            // Only log non-invalid token errors in development or if verbose logging is enabled
            if (process.env.NODE_ENV === 'development' || process.env.FIREBASE_VERBOSE_LOGGING === 'true') {
              console.error('[Firebase] Failed to send to token:', token.substring(0, 20) + '...', resp.error?.message || resp.error);
            }
          }
        }
      });
    }

    // Remove invalid tokens from database
    if (invalidTokens.length > 0) {
      const Device = require('../models/Device');
      try {
        const deleteResult = await Device.deleteMany({
          $or: [
            { fcmToken: { $in: invalidTokens } },
            { playerId: { $in: invalidTokens } } // Also check playerId for migration
          ]
        });
        console.log(`[Firebase] Removed ${deleteResult.deletedCount} invalid device token(s) from database`);
      } catch (dbError) {
        console.error('[Firebase] Error removing invalid tokens from database:', dbError.message);
      }
    }

    // Log success summary
    if (response.successCount > 0) {
      console.log(`[Firebase] ✅ Successfully sent ${response.successCount} push notification(s)`);
    }
    if (response.failureCount > 0) {
      console.log(`[Firebase] ⚠️  Failed to send ${response.failureCount} push notification(s)`);
    }

    return {
      ok: response.successCount > 0,
      successCount: response.successCount,
      failureCount: response.failureCount,
      invalidTokensRemoved: invalidTokens.length,
      otherFailures: otherFailedTokens.length,
    };
  } catch (err) {
    console.error('[Firebase] Send error:', err.message);
    return { ok: false, error: err.message };
  }
}

module.exports = { initializeFirebase, sendPush };
