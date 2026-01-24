# Backend Debug Logs Added

## ✅ Console.log Statements Added to All Controllers

I've added comprehensive debug logging to all backend controllers to help you track:
- Request parameters and query strings
- Request body data
- Database queries and results
- Response data structure
- Error handling
- User authentication state
- Business logic flow

## 📁 Controllers with Debug Logs

### 1. jobController.js

**Functions Logged:**
- `getJobs` - List all jobs with filters
- `getJobById` - Get single job details
- `getEligibleJobs` - Get eligible jobs for user

**Example Logs:**
```
[jobController] getJobs called
[jobController] Query params: { page: '1', limit: '20' }
[jobController] Filter object: { isActive: true }
[jobController] Jobs found: 10
[jobController] Total jobs: 50
[jobController] Response: { success: true, total: 50, ... }
```

### 2. schemeController.js

**Functions Logged:**
- `getSchemes` - List all schemes with filters
- `getSchemeById` - Get single scheme details
- `getEligibleSchemes` - Get eligible schemes for user

**Example Logs:**
```
[schemeController] getSchemes called
[schemeController] Query params: { page: '1', limit: '20' }
[schemeController] Schemes found: 15
[schemeController] Total schemes: 75
```

### 3. authController.js

**Functions Logged:**
- `sendOTPToUser` - Send OTP to mobile number
- `verifyOTP` - Verify OTP and login/register
- `logout` - Logout user

**Example Logs:**
```
[authController] sendOTPToUser called
[authController] Sending OTP to: 9876543210 Purpose: LOGIN
[authController] Generated OTP: 123456
[authController] OTP sent successfully

[authController] verifyOTP called
[authController] OTP lookup result: { found: true, ... }
[authController] User lookup: { found: true, userId: '...' }
[authController] verifyOTP success: { userId: '...', hasProfile: true }
```

### 4. userController.js

**Functions Logged:**
- `getProfile` - Get user profile
- `updateProfile` - Update user profile
- `getPreferences` - Get user preferences
- `updatePreferences` - Update user preferences

**Example Logs:**
```
[userController] getProfile called
[userController] User ID: 507f1f77bcf86cd799439011
[userController] Profile retrieved: { hasProfile: true, profileComplete: true }

[userController] updateProfile called
[userController] Profile data: { fullName: 'John Doe', ... }
[userController] Profile updated successfully
```

## 🔍 What Gets Logged

### Request Information
- Query parameters (filters, pagination)
- Request body data
- User ID from JWT token
- Route parameters (IDs)

### Database Operations
- Filter objects being used
- Query results (count, found items)
- User lookups
- Profile updates

### Business Logic
- Eligibility checks
- OTP generation and validation
- User creation/updates
- Pagination calculations

### Response Data
- Success/failure status
- Data counts
- Pagination info
- Error messages

## 📊 How to Use

### View Logs

**Backend Server Console:**
- All logs appear in the terminal where you run `npm start`
- Look for `[controllerName]` prefix to filter by controller

**Example Output:**
```
[jobController] getJobs called
[jobController] Query params: { page: '1', limit: '1' }
[jobController] Filter object: {}
[jobController] Jobs found: 1
[jobController] Total jobs: 50
[jobController] Response: { success: true, total: 50, page: 1, pages: 50 }
```

### Filter Logs

**By Controller:**
```
[jobController]
[schemeController]
[authController]
[userController]
```

**By Action:**
```
called
Response:
error
```

## 🎯 What to Look For

### API Request Issues
- Check if requests are reaching the backend
- Verify query parameters are correct
- See what filters are being applied

### Database Issues
- Check if queries are finding data
- Verify total counts match expectations
- See if user/profile lookups succeed

### Business Logic Issues
- Track eligibility calculations
- Monitor OTP flow
- Check profile updates

### Response Issues
- Verify response structure
- Check pagination calculations
- See if totals are correct

## 💡 Tips

- All logs are prefixed with controller name for easy filtering
- Sensitive data (OTP) is masked in logs
- Errors are logged with full stack traces
- Response data includes counts and totals for debugging

## 🔒 Security Note

- OTP values are logged (for development only)
- In production, consider removing or masking sensitive logs
- User IDs and mobile numbers are logged for debugging

## 📝 Log Format

All logs follow this pattern:
```
[ControllerName] Action: Details
```

Examples:
- `[jobController] getJobs called`
- `[authController] OTP sent successfully`
- `[userController] Profile updated successfully`
- `[schemeController] getSchemes error: ...`
