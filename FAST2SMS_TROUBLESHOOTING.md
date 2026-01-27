# Fast2SMS Troubleshooting Guide

## Issue: API Returns Success but SMS Not Received

If Fast2SMS API returns `"return": true` with a `request_id`, but you're not receiving the SMS, follow these steps:

### 1. Check Fast2SMS Dashboard
- Login to your Fast2SMS dashboard: https://www.fast2sms.com/dashboard
- Go to **Delivery Report** section
- Find your SMS using the `request_id` from the logs
- Check the delivery status:
  - ✅ **Delivered** - SMS was sent successfully
  - ❌ **Failed** - SMS failed to deliver
  - ⏳ **Pending** - SMS is still being processed
  - 🚫 **DND** - Number is on Do Not Disturb list
  - 🚫 **Blocked** - Number is blocked by carrier

### 2. Common Issues and Solutions

#### DND (Do Not Disturb) Registration
- **Problem**: Indian mobile numbers registered on DND may not receive promotional SMS
- **Solution**: 
  - Use Transactional SMS route (requires DLT registration)
  - Or ask users to de-register from DND for your service
  - Check DND status in Fast2SMS dashboard

#### Account Restrictions
- **Problem**: Free/trial accounts may have restrictions
- **Solution**: 
  - Complete account verification
  - Add sufficient balance
  - Check account status in dashboard

#### Carrier Filtering
- **Problem**: Some carriers filter SMS with certain keywords
- **Solution**: 
  - Use simpler message format (set `FAST2SMS_MESSAGE_FORMAT=simple` in `.env`)
  - Avoid promotional words in message
  - Use DLT route for better delivery

#### Network Delays
- **Problem**: SMS delivery can take 1-5 minutes
- **Solution**: Wait a few minutes and check again

### 3. Testing Steps

1. **Check Request ID**: Note the `request_id` from server logs
2. **Verify in Dashboard**: Check delivery status in Fast2SMS dashboard
3. **Test with Different Number**: Try with a different mobile number
4. **Check Spam Folder**: SMS might be in spam/junk folder
5. **Verify Number Format**: Ensure number is 10 digits without country code

### 4. Message Format Options

#### Simple Format (Recommended)
```
Your OTP is 123456. Valid for 15 min.
```
- Shorter message
- Better delivery rate
- Set `FAST2SMS_MESSAGE_FORMAT=simple` in `.env`

#### Detailed Format (Default)
```
Your RojgaAlert OTP is 123456. Valid for 15 minutes.
```
- More descriptive
- May have lower delivery rate
- Default format

### 5. Route Options

#### Quick SMS Route (`q`) - Current
- ✅ No verification needed
- ✅ Works immediately
- ⚠️ May have delivery issues with DND numbers
- ⚠️ May be filtered by carriers

#### OTP Route (`otp`)
- ✅ Better delivery for OTP messages
- ❌ Requires website verification in dashboard
- Set `FAST2SMS_ROUTE=otp` after verification

#### DLT Route (`dlt`)
- ✅ Best delivery rate
- ✅ Works with DND numbers
- ❌ Requires DLT registration
- ❌ Needs sender ID and template ID
- Set `FAST2SMS_ROUTE=dlt` after DLT setup

### 6. Quick Fixes

1. **Try Simple Message Format**:
   ```env
   FAST2SMS_MESSAGE_FORMAT=simple
   ```

2. **Check Account Balance**: Ensure sufficient balance in Fast2SMS account

3. **Verify API Key**: Make sure API key is correct and active

4. **Test with Different Number**: Try with a number not on DND

5. **Check Server Logs**: Look for detailed error messages

### 7. Contact Fast2SMS Support

If issues persist:
- Email: support@fast2sms.com
- Dashboard: https://www.fast2sms.com/dashboard
- Provide them with:
  - Request ID from logs
  - Mobile number (last 4 digits)
  - Timestamp
  - Account details

### 8. Alternative Solutions

If Fast2SMS continues to have delivery issues:
1. Complete DLT registration for better delivery
2. Use OTP route after website verification
3. Consider alternative SMS providers (Twilio, MSG91, etc.)

---

## Current Configuration

Check your `.env` file for:
- `FAST2SMS_API_KEY` - Your API key
- `FAST2SMS_ROUTE` - Current route (q/otp/dlt)
- `FAST2SMS_MESSAGE_FORMAT` - Message format (simple/detailed)

## Server Logs

When sending OTP, check logs for:
- `[Fast2SMS] Request ID: <id>` - Use this to track in dashboard
- `[Fast2SMS] API Response` - Full API response
- Any error messages or warnings
