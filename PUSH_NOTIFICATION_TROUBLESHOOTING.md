# Push Notification Troubleshooting Guide

## Current Status

Based on the logs, push notifications are being sent from the backend, but they may not be appearing on the device. Here's how to diagnose and fix the issue.

## Backend Logging

With the updated code, you should now see detailed logs when push notifications are sent:

```
[NotificationService] Sending push to user <id> with <n> token(s)
[Firebase] Sending push notification: { title: '...', body: '...', ... }
[Firebase] ✅ Successfully sent <n> push notification(s)
[NotificationService] ✅ Push sent successfully to user <id> (<n> success, <n> failed)
```

## Common Issues & Solutions

### 1. Invalid FCM Token
**Symptoms:**
- Logs show: `[Firebase] Invalid token detected`
- Token is automatically removed from database

**Solution:**
- Ensure the app registers a new FCM token after login
- Check that the device registration endpoint is being called
- Verify the token is being saved to the database

### 2. Notification Channel Not Created (Android)
**Symptoms:**
- Push is sent successfully but not displayed
- No error in logs

**Solution:**
- Ensure the Android app creates a notification channel with ID `rojgaalert_default`
- The channel should be created when the app starts
- Check `MainApplication.java` or `MainActivity.java` for channel creation

**Example Android code:**
```java
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
    NotificationChannel channel = new NotificationChannel(
        "rojgaalert_default",
        "RojgaAlert Notifications",
        NotificationManager.IMPORTANCE_HIGH
    );
    channel.setDescription("Job and scheme alerts");
    NotificationManager manager = getSystemService(NotificationManager.class);
    manager.createNotificationChannel(channel);
}
```

### 3. App Not Handling Background Notifications
**Symptoms:**
- Notifications work when app is in foreground
- Notifications don't appear when app is in background

**Solution:**
- Ensure `@react-native-firebase/messaging` is properly configured
- Set up background message handler
- Check AndroidManifest.xml for proper permissions

### 4. Notification Permissions Not Granted
**Symptoms:**
- No notifications appear at all
- No errors in logs

**Solution:**
- Request notification permissions in the app
- Check if user has granted notification permissions
- On Android 13+, runtime permission is required

### 5. FCM Token Not Registered
**Symptoms:**
- Logs show: `[NotificationService] No FCM tokens found for user <id>`
- Device registration endpoint not being called

**Solution:**
- Ensure the app calls `/api/notifications/register-device` after login
- Verify the FCM token is being generated correctly
- Check that the token is being sent to the backend

## Testing Steps

### Step 1: Check Backend Logs
When creating a job, look for:
```
[NotificationService] Sending push to user <id> with <n> token(s)
[Firebase] ✅ Successfully sent <n> push notification(s)
```

If you see these, the backend is working correctly.

### Step 2: Verify FCM Token
Check the database:
```javascript
// In MongoDB or via API
db.devices.find({ userId: ObjectId("...") })
```

Verify:
- Token exists
- Token is recent (not expired)
- Token format is correct (starts with device identifier)

### Step 3: Test with Firebase Console
1. Go to Firebase Console → Cloud Messaging
2. Send a test notification using the FCM token from database
3. If this works, the issue is in the app configuration
4. If this doesn't work, the token is invalid

### Step 4: Check App Configuration
1. Verify `google-services.json` is in `android/app/`
2. Check AndroidManifest.xml has notification permissions
3. Ensure notification channel is created
4. Verify background message handler is set up

## Debugging Commands

### Check Device Tokens
```bash
# Via MongoDB
db.devices.find().pretty()

# Via API (if endpoint exists)
curl https://api.tatsatinfotech.com/api/notifications/devices
```

### Test Push Notification Manually
You can test by creating a job via the admin panel and watching the logs.

## Expected Log Flow

When a job is created:
1. `[adminController] createJob called`
2. `[adminController] Job created`
3. `[NotificationService] Sending push to user <id> with <n> token(s)`
4. `[Firebase] Sending push notification: {...}`
5. `[Firebase] ✅ Successfully sent <n> push notification(s)`
6. `[NotificationService] ✅ Push sent successfully to user <id>`

If any step is missing, that's where the issue is.

## React Native App Checklist

- [ ] `@react-native-firebase/messaging` is installed and configured
- [ ] `google-services.json` is in `android/app/`
- [ ] Notification channel `rojgaalert_default` is created
- [ ] Background message handler is set up
- [ ] Notification permissions are requested
- [ ] FCM token is registered after login
- [ ] App handles both foreground and background notifications

## Next Steps

1. **Check the logs** when creating a new job - you should see detailed push notification logs
2. **Verify the FCM token** is valid and registered
3. **Test with Firebase Console** to isolate backend vs app issues
4. **Check app configuration** for notification channel and permissions

## Contact Points

If push notifications are being sent successfully (logs show success) but not appearing:
- The issue is likely in the React Native app configuration
- Check notification channel creation
- Verify background message handlers
- Test with Firebase Console directly
