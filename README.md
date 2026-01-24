# RojgaAlert Backend API

Backend API for the RojgaAlert application built with Node.js, Express, and MongoDB.

## Features

- User authentication with OTP-based login/registration
- Job and Scheme management
- User profile and preferences
- Admin dashboard with CRUD operations
- Eligibility checking for jobs and schemes
- Role-based access control (USER/ADMIN)
- JWT token authentication
- Rate limiting and security middleware

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory and configure:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/rojgaalert
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=7d
OTP_EXPIRE_MINUTES=15
OTP_MAX_ATTEMPTS=5
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

3. Make sure MongoDB is running on your system

4. Start the server:
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to mobile number
- `POST /api/auth/verify-otp` - Verify OTP and login/register
- `POST /api/auth/logout` - Logout user (requires auth)

### User Profile
- `GET /api/user/profile` - Get user profile (requires auth)
- `PUT /api/user/profile` - Update user profile (requires auth)
- `GET /api/user/preferences` - Get user preferences (requires auth)
- `PUT /api/user/preferences` - Update user preferences (requires auth)

### Jobs
- `GET /api/jobs` - Get all jobs (with filters)
- `GET /api/jobs/:id` - Get job by ID
- `GET /api/jobs/eligible` - Get eligible jobs for logged-in user (requires auth)

### Schemes
- `GET /api/schemes` - Get all schemes (with filters)
- `GET /api/schemes/:id` - Get scheme by ID
- `GET /api/schemes/eligible` - Get eligible schemes for logged-in user (requires auth)

### Admin
- `POST /api/admin/jobs` - Create job (requires admin)
- `PUT /api/admin/jobs/:id` - Update job (requires admin)
- `DELETE /api/admin/jobs/:id` - Delete job (requires admin)
- `POST /api/admin/schemes` - Create scheme (requires admin)
- `PUT /api/admin/schemes/:id` - Update scheme (requires admin)
- `DELETE /api/admin/schemes/:id` - Delete scheme (requires admin)
- `GET /api/admin/users` - Get users list (requires admin)
- `GET /api/admin/stats` - Get dashboard statistics (requires admin)

## Request Examples

### Send OTP
```json
POST /api/auth/send-otp
{
  "mobileNumber": "9876543210",
  "purpose": "LOGIN"
}
```

### Verify OTP
```json
POST /api/auth/verify-otp
{
  "mobileNumber": "9876543210",
  "otp": "123456",
  "profile": {
    "fullName": "John Doe",
    "dateOfBirth": "1995-01-01",
    "education": "Graduate",
    "state": "Maharashtra",
    "district": "Mumbai",
    "preferredDomains": ["ALL"]
  }
}
```

### Create Job (Admin)
```json
POST /api/admin/jobs
Headers: Authorization: Bearer <token>
{
  "title": "Police Constable",
  "jobType": "STATE",
  "domain": "Police",
  "state": "Maharashtra",
  "education": "12th",
  "ageMin": 18,
  "ageMax": 25,
  "lastDate": "2024-12-31",
  "description": "Recruitment for Police Constable",
  "applicationLink": "https://example.com/apply",
  "vacancyCount": 1000
}
```

## Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── adminController.js   # Admin operations
│   ├── authController.js    # Authentication
│   ├── jobController.js     # Job operations
│   ├── schemeController.js  # Scheme operations
│   └── userController.js    # User operations
├── middleware/
│   ├── auth.js              # Authentication middleware
│   └── errorHandler.js      # Error handling
├── models/
│   ├── Job.js               # Job model
│   ├── OTP.js               # OTP model
│   ├── Scheme.js            # Scheme model
│   ├── User.js              # User model
│   └── UserPreference.js    # User preference model
├── routes/
│   ├── admin.js             # Admin routes
│   ├── auth.js              # Auth routes
│   ├── jobs.js              # Job routes
│   ├── schemes.js           # Scheme routes
│   └── user.js              # User routes
├── utils/
│   ├── eligibility.js       # Eligibility checking
│   ├── generateOTP.js       # OTP generation
│   ├── jwtToken.js          # JWT utilities
│   └── sendOTP.js           # SMS sending (mock)
├── .env.example             # Environment variables example
├── .gitignore
├── package.json
├── server.js                # Main server file
└── README.md
```

## Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting on API routes
- JWT token authentication
- Input validation
- Role-based access control
- Permission-based admin access

## Notes

- OTP sending is currently mocked (logs to console). Configure Twilio in `utils/sendOTP.js` for production.
- Make sure to use a strong JWT_SECRET in production.
- Configure MongoDB connection string according to your setup.