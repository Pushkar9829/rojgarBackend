# OTP Configuration

## Overview

The system uses **two different OTP modes** based on the mobile number:

1. **Seeded Numbers**: Use hardcoded OTP `123456` (NO Fast2SMS SMS)
2. **Other Numbers**: Use random 6-digit OTP sent via Fast2SMS

---

## Seeded Numbers (Hardcoded OTP: 123456)

These numbers are from the seed database and use hardcoded OTP `123456`:

### Super Admin (1)
- `9876543210`

### Sub Admins (10)
- `9876543211` - `9876543220`

### Regular Users (8)
- `9876543221` - `9876543228`

**Total: 19 seeded numbers**

### Behavior for Seeded Numbers:
- OTP is always `123456`
- **NO SMS is sent** via Fast2SMS
- OTP is saved to database
- Can login immediately with `123456`

---

## Other Numbers (Fast2SMS OTP)

All mobile numbers **NOT** in the seeded list will:
- Generate a **random 6-digit OTP**
- Send OTP via **Fast2SMS SMS**
- Require valid `FAST2SMS_API_KEY` in `.env`
- OTP expires in 15 minutes (configurable via `OTP_EXPIRE_MINUTES`)

### Requirements:
- `FAST2SMS_API_KEY` must be set in `.env`
- Fast2SMS account must have sufficient balance
- Fast2SMS route configured (default: 'q' for Quick SMS)

---

## Configuration Files

### 1. Seeded Numbers List
**File**: `backend/config/seededNumbers.js`

Contains the list of mobile numbers that use hardcoded OTP.

### 2. Auth Controller
**File**: `backend/controllers/authController.js`

Checks if mobile number is seeded:
- If seeded → Use `123456`, skip Fast2SMS
- If not seeded → Generate random OTP, send via Fast2SMS

### 3. Send OTP Utility
**File**: `backend/utils/sendOTP.js`

Handles Fast2SMS API integration for non-seeded numbers.

---

## Environment Variables

```env
# Fast2SMS Configuration (required for non-seeded numbers)
FAST2SMS_API_KEY=your_api_key_here
FAST2SMS_ROUTE=q  # Options: 'q' (Quick SMS), 'otp', 'dlt'
FAST2SMS_MESSAGE_FORMAT=simple  # Options: 'simple' or default

# OTP Configuration
OTP_EXPIRE_MINUTES=15
OTP_MAX_ATTEMPTS=5
```

---

## How It Works

### Flow for Seeded Numbers:
1. User requests OTP for seeded number (e.g., `9876543210`)
2. System checks `seededNumbers.js` → Number is found
3. OTP `123456` is generated and saved to database
4. **SMS is NOT sent** (hardcoded mode)
5. User can login with `123456`

### Flow for Other Numbers:
1. User requests OTP for non-seeded number (e.g., `9829699382`)
2. System checks `seededNumbers.js` → Number NOT found
3. Random 6-digit OTP is generated (e.g., `456789`)
4. OTP is saved to database
5. **SMS is sent** via Fast2SMS
6. User receives SMS and can login with the OTP

---

## Adding/Removing Seeded Numbers

To modify the list of seeded numbers:

1. Edit `backend/config/seededNumbers.js`
2. Add/remove mobile numbers from `SEEDED_MOBILE_NUMBERS` array
3. Restart the server

**Example:**
```javascript
const SEEDED_MOBILE_NUMBERS = [
  '9876543210',
  '9876543211',
  // Add new numbers here
  '9999999999',
];
```

---

## Testing

### Test Seeded Number:
```bash
# Request OTP for seeded number
POST /api/auth/send-otp
{
  "mobileNumber": "9876543210"
}

# Response: OTP 123456 (no SMS sent)
# Login with OTP: 123456
```

### Test Non-Seeded Number:
```bash
# Request OTP for non-seeded number
POST /api/auth/send-otp
{
  "mobileNumber": "9829699382"
}

# Response: Random OTP (SMS sent via Fast2SMS)
# Login with OTP from SMS
```

---

## Troubleshooting

### Seeded Numbers Not Working:
- Check `backend/config/seededNumbers.js` has the correct numbers
- Verify the number is in the `SEEDED_MOBILE_NUMBERS` array
- Restart server after changes

### Fast2SMS Not Sending:
- Verify `FAST2SMS_API_KEY` is set in `.env`
- Check Fast2SMS account balance
- Verify Fast2SMS route is correct (`FAST2SMS_ROUTE=q`)
- Check server logs for Fast2SMS errors

### OTP Not Received:
- For seeded numbers: Use `123456` (no SMS sent)
- For other numbers: Check SMS delivery status in Fast2SMS dashboard
- Verify mobile number format (10 digits)
- Check DND status on mobile number

---

## Notes

- Seeded numbers are primarily for **development/testing**
- In production, consider removing seeded numbers or limiting them to admin accounts only
- Fast2SMS requires account verification and balance for SMS delivery
- OTP expires after 15 minutes (configurable)
- Maximum 5 OTP attempts per mobile number
