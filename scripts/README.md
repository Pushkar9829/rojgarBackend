# Database Seeding Scripts

## seedDatabase.js

This script populates the database with sample data for development and testing purposes.

### Usage

```bash
# Using npm script (recommended)
npm run seed

# Or directly with node
node scripts/seedDatabase.js
```

### What it does

The script will:

1. **Clear existing data** (all collections: users, jobs, schemes, user_preferences)
2. **Create sample users**:
   - 1 Admin user (mobile: 9876543210)
   - 5 Regular users with complete profiles
3. **Create sample jobs**:
   - 8 jobs covering different domains (Police, Defence, Railway, Teaching, Health, Clerk, Technical, Apprentice)
   - Mix of CENTRAL and STATE jobs
   - Some featured, some regular
4. **Create sample schemes**:
   - 7 schemes covering different types (Money, Training, Subsidy)
   - Mix of CENTRAL and STATE schemes
   - Different target audiences
5. **Create user preferences**:
   - Preferences for all regular users

### Sample Data Details

#### Admin User
- Mobile: `9876543210`
- Role: `ADMIN`
- Full permissions

#### Regular Users
- Multiple users with different:
  - Education levels (10th, 12th, ITI, Graduate)
  - States (Maharashtra, Delhi, Uttar Pradesh, Bihar, Gujarat)
  - Preferred domains
  - Age ranges

#### Jobs
- Covers all 8 domains
- Mix of age requirements
- Various education requirements
- Both CENTRAL and STATE jobs
- Realistic dates and vacancy counts

#### Schemes
- Training schemes
- Financial assistance schemes
- Subsidy schemes
- Different age ranges and eligibility criteria

### Environment Variables

Make sure your `.env` file has the correct `MONGODB_URI` configured:

```env
MONGODB_URI=mongodb://localhost:27017/rojgaalert
```

### Important Notes

⚠️ **Warning**: The script will **DELETE ALL EXISTING DATA** before seeding. 

If you want to keep existing data, comment out the deletion section in the script:

```javascript
// Comment these lines if you want to keep existing data
// await User.deleteMany({});
// await Job.deleteMany({});
// await Scheme.deleteMany({});
// await UserPreference.deleteMany({});
```

### Testing the Seeded Data

After running the seed script:

1. **Admin Login**: Use mobile number `9876543210` to login to the admin panel
2. **User Login**: Use any of the regular user mobile numbers (9876543211-9876543215)
3. **API Testing**: All endpoints should work with the seeded data

### Customization

You can modify the sample data arrays in `seedDatabase.js`:
- `sampleUsers` - Add more users
- `sampleJobs` - Add more jobs
- `sampleSchemes` - Add more schemes

Make sure all data follows the schema validation rules defined in the models.