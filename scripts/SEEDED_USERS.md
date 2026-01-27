# Seeded Users - Login Credentials

## 🔐 OTP for All Users: `123456` (HARDCODED - NO Fast2SMS)

**IMPORTANT**: OTP `123456` is **HARDCODED** for all users. **NO SMS will be sent via Fast2SMS** for admin, subadmin, or regular users.

The auth controller automatically generates OTP `123456` when you request OTP via `/api/auth/send-otp`, but it will **NOT** send SMS.

---

## 📋 Quick Reference - All Mobile Numbers & Roles

| Mobile Number | Role | Name | Details |
|--------------|------|------|---------|
| **9876543210** | SUPER ADMIN | Super Admin | Full permissions, All states |
| **9876543211** | SUB ADMIN | Sub Admin - Mumbai | Maharashtra, Limited permissions |
| **9876543212** | SUB ADMIN | Sub Admin - New Delhi | Delhi, Limited permissions |
| **9876543213** | SUB ADMIN | Sub Admin - Uttar Pradesh | UP, Limited permissions |
| **9876543214** | SUB ADMIN | Sub Admin - Bihar | Bihar, Limited permissions |
| **9876543215** | SUB ADMIN | Sub Admin - Gujarat | Gujarat, Limited permissions |
| **9876543216** | SUB ADMIN | Sub Admin - Maharashtra | Maharashtra, Limited permissions |
| **9876543217** | SUB ADMIN | Sub Admin - Delhi | Delhi, Limited permissions |
| **9876543218** | SUB ADMIN | Sub Admin - Pune | Maharashtra, Limited permissions |
| **9876543219** | SUB ADMIN | Sub Admin - Kanpur | UP, Limited permissions |
| **9876543220** | SUB ADMIN | Sub Admin - Kerala | Kerala, Limited permissions |
| **9876543221** | USER | Rahul Kumar | Maharashtra, Mumbai, Graduate |
| **9876543222** | USER | Priya Sharma | Delhi, New Delhi, 12th |
| **9876543223** | USER | Amit Singh | UP, Lucknow, ITI |
| **9876543224** | USER | Sunita Devi | Bihar, Patna, 10th |
| **9876543225** | USER | Vikram Patel | Gujarat, Ahmedabad, Graduate |
| **9876543226** | USER | Anjali Mehta | Maharashtra, Pune, Graduate |
| **9876543227** | USER | Rajesh Yadav | UP, Kanpur, 12th |
| **9876543228** | USER | Kavita Nair | Kerala, Kochi, 10th |

**Total: 19 users (1 Super Admin, 10 Sub Admins, 8 Regular Users)**

---

## 👑 SUPER ADMIN (1)

| Mobile Number | Name | Email | Assigned States | Permissions |
|--------------|------|-------|----------------|-------------|
| **9876543210** | Super Admin | admin@rojgaalert.com | All States | All Permissions |

### Super Admin Permissions:
- Full access to all features
- Can manage all subadmins
- Can create/edit/delete jobs and schemes for all states
- Can view all users

---

## 📱 SUB ADMINS (10)

| Mobile Number | Name | Email | Assigned States | Permissions |
|--------------|------|-------|----------------|-------------|
| **9876543211** | Sub Admin - Mumbai | subadmin.mumbai@rojgaalert.com | Maharashtra | CREATE_JOBS, EDIT_JOBS, CREATE_SCHEMES, EDIT_SCHEMES, VIEW_USERS |
| **9876543212** | Sub Admin - New Delhi | subadmin.newdelhi@rojgaalert.com | Delhi | CREATE_JOBS, EDIT_JOBS, CREATE_SCHEMES, VIEW_USERS |
| **9876543213** | Sub Admin - Uttar Pradesh | subadmin.up@rojgaalert.com | Uttar Pradesh | CREATE_JOBS, EDIT_JOBS, CREATE_SCHEMES, EDIT_SCHEMES, VIEW_USERS |
| **9876543214** | Sub Admin - Bihar | subadmin.bihar@rojgaalert.com | Bihar | CREATE_JOBS, EDIT_JOBS, CREATE_SCHEMES, VIEW_USERS |
| **9876543215** | Sub Admin - Gujarat | subadmin.gujarat@rojgaalert.com | Gujarat | CREATE_JOBS, EDIT_JOBS, CREATE_SCHEMES, EDIT_SCHEMES, VIEW_USERS |
| **9876543216** | Sub Admin - Maharashtra | subadmin.mh@rojgaalert.com | Maharashtra | CREATE_JOBS, EDIT_JOBS, CREATE_SCHEMES, EDIT_SCHEMES, VIEW_USERS |
| **9876543217** | Sub Admin - Delhi | subadmin.del@rojgaalert.com | Delhi | CREATE_JOBS, EDIT_JOBS, CREATE_SCHEMES, VIEW_USERS |
| **9876543218** | Sub Admin - Pune | subadmin.pune@rojgaalert.com | Maharashtra | CREATE_JOBS, EDIT_JOBS, CREATE_SCHEMES, VIEW_USERS |
| **9876543219** | Sub Admin - Kanpur | subadmin.kanpur@rojgaalert.com | Uttar Pradesh | CREATE_JOBS, EDIT_JOBS, VIEW_USERS |
| **9876543220** | Sub Admin - Kerala | subadmin.kerala@rojgaalert.com | Kerala | CREATE_JOBS, EDIT_JOBS, CREATE_SCHEMES, EDIT_SCHEMES, VIEW_USERS |

### Sub Admin Permissions:
- Limited permissions based on assigned states
- Can only manage jobs/schemes for their assigned states
- Cannot delete jobs/schemes (unless explicitly granted)
- Cannot manage other admins

---

## 👤 REGULAR USERS (8)

| Mobile Number | Name | State | District | Education | Preferred Domains |
|--------------|------|-------|----------|-----------|------------------|
| **9876543221** | Rahul Kumar | Maharashtra | Mumbai | Graduate | ALL |
| **9876543222** | Priya Sharma | Delhi | New Delhi | 12th | Teaching, Clerk |
| **9876543223** | Amit Singh | Uttar Pradesh | Lucknow | ITI | Technical, Apprentice |
| **9876543224** | Sunita Devi | Bihar | Patna | 10th | Health, Clerk |
| **9876543225** | Vikram Patel | Gujarat | Ahmedabad | Graduate | Police, Defence |
| **9876543226** | Anjali Mehta | Maharashtra | Pune | Graduate | Teaching, Health |
| **9876543227** | Rajesh Yadav | Uttar Pradesh | Kanpur | 12th | Railway, Technical |
| **9876543228** | Kavita Nair | Kerala | Kochi | 10th | Clerk, Apprentice |

---

## 📊 Summary

- **Total Users**: 19
  - **Super Admin**: 1
  - **Sub Admins**: 10
  - **Regular Users**: 8
- **OTP**: `123456` (HARDCODED - works for all numbers)
- **OTP Valid For**: 1 year (from seed time)
- **Fast2SMS**: **DISABLED** - No SMS will be sent for any user
- **Note**: The auth flow generates OTP `123456` automatically when you request OTP, but does NOT send SMS

---

## 🚀 Quick Login Test

1. **Super Admin Login:**
   - Mobile: `9876543210`
   - OTP: `123456`
   - Access: Full admin panel with all permissions

2. **Sub Admin Login:**
   - Mobile: `9876543211` (or any subadmin number)
   - OTP: `123456`
   - Access: Admin panel with limited permissions for assigned states

3. **Regular User Login:**
   - Mobile: `9876543221` (or any user number)
   - OTP: `123456`
   - Access: User dashboard

---

## 📝 Important Notes

- **NO Fast2SMS SMS**: OTP `123456` is hardcoded. No SMS will be sent via Fast2SMS for any user (admin, subadmin, or regular).
- All OTP entries are created with `purpose: 'LOGIN'`
- Seeded OTP entries expire 1 year after seeding
- **Critical**: The auth controller is configured to always generate OTP `123456` and skip Fast2SMS
- When you request OTP via `/api/auth/send-otp`, it will generate `123456` but will NOT send SMS
- All users have device entries (for push notifications)
- Regular users have notifications seeded
- Admin actions are logged in audit logs

---

## 🔄 Re-seeding

To reset the database and create fresh seed data:

```bash
cd backend
npm run seed
```

This will:
- Clear all existing data
- Create fresh users (1 super admin, 10 sub admins, 8 regular users)
- Create jobs and schemes
- Create OTP entries with `123456` for all users (NO SMS sent)
- Create device entries
- Create notifications
- Create audit logs

---

## ⚠️ Fast2SMS Configuration

**Fast2SMS is DISABLED** in the current setup. The system uses hardcoded OTP `123456` for all users.

If you need to enable Fast2SMS in the future:
1. Set `FAST2SMS_API_KEY` in `.env`
2. Update `backend/utils/sendOTP.js` to remove the hardcoded mode
3. Update `backend/controllers/authController.js` to call `sendOTP()` properly
