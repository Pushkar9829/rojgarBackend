require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Job = require('../models/Job');
const Scheme = require('../models/Scheme');
const UserPreference = require('../models/UserPreference');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const Device = require('../models/Device');
const OTP = require('../models/OTP');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rojgaalert');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Sample data
const sampleUsers = [
  {
    mobileNumber: '9876543210',
    role: 'ADMIN',
    adminProfile: {
      name: 'Super Admin',
      email: 'admin@rojgaalert.com',
      permissions: [
        'CREATE_JOBS',
        'EDIT_JOBS',
        'DELETE_JOBS',
        'CREATE_SCHEMES',
        'EDIT_SCHEMES',
        'DELETE_SCHEMES',
        'VIEW_USERS',
        'MANAGE_ADMINS',
      ],
      assignedStates: [],
      verificationStatus: 'VERIFIED',
    },
  },
  {
    mobileNumber: '9876543211',
    role: 'ADMIN',
    adminProfile: {
      name: 'Sub Admin - Mumbai',
      email: 'subadmin.mumbai@rojgaalert.com',
      permissions: [
        'CREATE_JOBS',
        'EDIT_JOBS',
        'CREATE_SCHEMES',
        'EDIT_SCHEMES',
        'VIEW_USERS',
      ],
      assignedStates: ['Maharashtra'],
      verificationStatus: 'VERIFIED',
    },
  },
  {
    mobileNumber: '9876543212',
    role: 'ADMIN',
    adminProfile: {
      name: 'Sub Admin - New Delhi',
      email: 'subadmin.newdelhi@rojgaalert.com',
      permissions: [
        'CREATE_JOBS',
        'EDIT_JOBS',
        'CREATE_SCHEMES',
        'VIEW_USERS',
      ],
      assignedStates: ['Delhi'],
      verificationStatus: 'VERIFIED',
    },
  },
  {
    mobileNumber: '9876543213',
    role: 'ADMIN',
    adminProfile: {
      name: 'Sub Admin - Uttar Pradesh',
      email: 'subadmin.up@rojgaalert.com',
      permissions: [
        'CREATE_JOBS',
        'EDIT_JOBS',
        'CREATE_SCHEMES',
        'EDIT_SCHEMES',
        'VIEW_USERS',
      ],
      assignedStates: ['Uttar Pradesh'],
      verificationStatus: 'VERIFIED',
    },
  },
  {
    mobileNumber: '9876543214',
    role: 'ADMIN',
    adminProfile: {
      name: 'Sub Admin - Bihar',
      email: 'subadmin.bihar@rojgaalert.com',
      permissions: [
        'CREATE_JOBS',
        'EDIT_JOBS',
        'CREATE_SCHEMES',
        'VIEW_USERS',
      ],
      assignedStates: ['Bihar'],
      verificationStatus: 'VERIFIED',
    },
  },
  {
    mobileNumber: '9876543215',
    role: 'ADMIN',
    adminProfile: {
      name: 'Sub Admin - Gujarat',
      email: 'subadmin.gujarat@rojgaalert.com',
      permissions: [
        'CREATE_JOBS',
        'EDIT_JOBS',
        'CREATE_SCHEMES',
        'EDIT_SCHEMES',
        'VIEW_USERS',
      ],
      assignedStates: ['Gujarat'],
      verificationStatus: 'VERIFIED',
    },
  },
  {
    mobileNumber: '9876543216',
    role: 'ADMIN',
    adminProfile: {
      name: 'Sub Admin - Maharashtra',
      email: 'subadmin.mh@rojgaalert.com',
      permissions: [
        'CREATE_JOBS',
        'EDIT_JOBS',
        'CREATE_SCHEMES',
        'EDIT_SCHEMES',
        'VIEW_USERS',
      ],
      assignedStates: ['Maharashtra'],
      verificationStatus: 'VERIFIED',
    },
  },
  {
    mobileNumber: '9876543217',
    role: 'ADMIN',
    adminProfile: {
      name: 'Sub Admin - Delhi',
      email: 'subadmin.del@rojgaalert.com',
      permissions: [
        'CREATE_JOBS',
        'EDIT_JOBS',
        'CREATE_SCHEMES',
        'VIEW_USERS',
      ],
      assignedStates: ['Delhi'],
      verificationStatus: 'VERIFIED',
    },
  },
  {
    mobileNumber: '9876543218',
    role: 'ADMIN',
    adminProfile: {
      name: 'Sub Admin - Pune',
      email: 'subadmin.pune@rojgaalert.com',
      permissions: [
        'CREATE_JOBS',
        'EDIT_JOBS',
        'CREATE_SCHEMES',
        'VIEW_USERS',
      ],
      assignedStates: ['Maharashtra'],
      verificationStatus: 'VERIFIED',
    },
  },
  {
    mobileNumber: '9876543219',
    role: 'ADMIN',
    adminProfile: {
      name: 'Sub Admin - Kanpur',
      email: 'subadmin.kanpur@rojgaalert.com',
      permissions: [
        'CREATE_JOBS',
        'EDIT_JOBS',
        'VIEW_USERS',
      ],
      assignedStates: ['Uttar Pradesh'],
      verificationStatus: 'VERIFIED',
    },
  },
  {
    mobileNumber: '9876543220',
    role: 'ADMIN',
    adminProfile: {
      name: 'Sub Admin - Kerala',
      email: 'subadmin.kerala@rojgaalert.com',
      permissions: [
        'CREATE_JOBS',
        'EDIT_JOBS',
        'CREATE_SCHEMES',
        'EDIT_SCHEMES',
        'VIEW_USERS',
      ],
      assignedStates: ['Kerala'],
      verificationStatus: 'VERIFIED',
    },
  },
  // Regular Users
  {
    mobileNumber: '9876543221',
    role: 'USER',
    profile: {
      fullName: 'Rahul Kumar',
      dateOfBirth: new Date('1998-05-15'),
      education: 'Graduate',
      state: 'Maharashtra',
      district: 'Mumbai',
      preferredDomains: ['ALL'],
    },
  },
  {
    mobileNumber: '9876543222',
    role: 'USER',
    profile: {
      fullName: 'Priya Sharma',
      dateOfBirth: new Date('2000-08-20'),
      education: '12th',
      state: 'Delhi',
      district: 'New Delhi',
      preferredDomains: ['Teaching', 'Clerk'],
    },
  },
  {
    mobileNumber: '9876543223',
    role: 'USER',
    profile: {
      fullName: 'Amit Singh',
      dateOfBirth: new Date('1995-03-10'),
      education: 'ITI',
      state: 'Uttar Pradesh',
      district: 'Lucknow',
      preferredDomains: ['Technical', 'Apprentice'],
    },
  },
  {
    mobileNumber: '9876543224',
    role: 'USER',
    profile: {
      fullName: 'Sunita Devi',
      dateOfBirth: new Date('1999-11-25'),
      education: '10th',
      state: 'Bihar',
      district: 'Patna',
      preferredDomains: ['Health', 'Clerk'],
    },
  },
  {
    mobileNumber: '9876543225',
    role: 'USER',
    profile: {
      fullName: 'Vikram Patel',
      dateOfBirth: new Date('1997-07-18'),
      education: 'Graduate',
      state: 'Gujarat',
      district: 'Ahmedabad',
      preferredDomains: ['Police', 'Defence'],
    },
  },
  {
    mobileNumber: '9876543226',
    role: 'USER',
    profile: {
      fullName: 'Anjali Mehta',
      dateOfBirth: new Date('1996-09-12'),
      education: 'Graduate',
      state: 'Maharashtra',
      district: 'Pune',
      preferredDomains: ['Teaching', 'Health'],
    },
  },
  {
    mobileNumber: '9876543227',
    role: 'USER',
    profile: {
      fullName: 'Rajesh Yadav',
      dateOfBirth: new Date('1994-12-05'),
      education: '12th',
      state: 'Uttar Pradesh',
      district: 'Kanpur',
      preferredDomains: ['Railway', 'Technical'],
    },
  },
  {
    mobileNumber: '9876543228',
    role: 'USER',
    profile: {
      fullName: 'Kavita Nair',
      dateOfBirth: new Date('2001-02-28'),
      education: '10th',
      state: 'Kerala',
      district: 'Kochi',
      preferredDomains: ['Clerk', 'Apprentice'],
    },
  },
];

const sampleJobs = [
  {
    title: 'Constable Recruitment - Maharashtra Police',
    jobType: 'STATE',
    domain: 'Police',
    state: 'Maharashtra',
    education: '12th',
    ageMin: 18,
    ageMax: 28,
    lastDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    description: 'Recruitment for Constable position in Maharashtra Police Force. Physical fitness test required.',
    applicationLink: 'https://example.com/police-recruitment',
    vacancyCount: 5000,
    salaryRange: {
      min: 25000,
      max: 35000,
      currency: 'INR',
    },
    requirements: ['Physical Fitness Test', 'Written Examination', 'Medical Test'],
    isActive: true,
    isFeatured: true,
  },
  {
    title: 'Railway Group D Recruitment',
    jobType: 'CENTRAL',
    domain: 'Railway',
    state: 'All India',
    education: '10th',
    ageMin: 18,
    ageMax: 33,
    lastDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    description: 'Indian Railways Group D recruitment for various posts across India.',
    applicationLink: 'https://example.com/railway-recruitment',
    vacancyCount: 10000,
    salaryRange: {
      min: 18000,
      max: 22000,
      currency: 'INR',
    },
    requirements: ['10th Pass', 'Physical Test'],
    isActive: true,
    isFeatured: true,
  },
  {
    title: 'Indian Army Soldier Recruitment',
    jobType: 'CENTRAL',
    domain: 'Defence',
    state: 'All India',
    education: '10th',
    ageMin: 17,
    ageMax: 23,
    lastDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    description: 'Recruitment for Soldier (General Duty) in Indian Army.',
    applicationLink: 'https://example.com/army-recruitment',
    vacancyCount: 50000,
    salaryRange: {
      min: 30000,
      max: 40000,
      currency: 'INR',
    },
    requirements: ['Physical Fitness', 'Medical Examination', 'Written Test'],
    isActive: true,
    isFeatured: true,
  },
  {
    title: 'Primary Teacher Recruitment - Delhi',
    jobType: 'STATE',
    domain: 'Teaching',
    state: 'Delhi',
    education: 'Graduate',
    ageMin: 21,
    ageMax: 35,
    lastDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    description: 'Recruitment for Primary Teacher position in Delhi Government Schools.',
    applicationLink: 'https://example.com/teacher-recruitment',
    vacancyCount: 2000,
    salaryRange: {
      min: 35000,
      max: 45000,
      currency: 'INR',
    },
    requirements: ['Graduate with B.Ed', 'CTET Qualified'],
    isActive: true,
    isFeatured: false,
  },
  {
    title: 'Staff Nurse Recruitment - UP Health',
    jobType: 'STATE',
    domain: 'Health',
    state: 'Uttar Pradesh',
    education: '12th',
    ageMin: 18,
    ageMax: 35,
    lastDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000), // 75 days from now
    description: 'Recruitment for Staff Nurse positions in UP Health Department.',
    applicationLink: 'https://example.com/nurse-recruitment',
    vacancyCount: 3000,
    salaryRange: {
      min: 28000,
      max: 35000,
      currency: 'INR',
    },
    requirements: ['12th with Nursing Diploma', 'Registration Certificate'],
    isActive: true,
    isFeatured: false,
  },
  {
    title: 'Junior Clerk - Bihar Secretariat',
    jobType: 'STATE',
    domain: 'Clerk',
    state: 'Bihar',
    education: 'Graduate',
    ageMin: 21,
    ageMax: 37,
    lastDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    description: 'Recruitment for Junior Clerk positions in Bihar Secretariat.',
    applicationLink: 'https://example.com/clerk-recruitment',
    vacancyCount: 1500,
    salaryRange: {
      min: 22000,
      max: 30000,
      currency: 'INR',
    },
    requirements: ['Graduate', 'Typing Speed Test'],
    isActive: true,
    isFeatured: false,
  },
  {
    title: 'ITI Apprentice - Central Government',
    jobType: 'CENTRAL',
    domain: 'Apprentice',
    state: 'All India',
    education: 'ITI',
    ageMin: 18,
    ageMax: 25,
    lastDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
    description: 'Apprenticeship opportunities for ITI candidates in various central government departments.',
    applicationLink: 'https://example.com/apprentice',
    vacancyCount: 5000,
    salaryRange: {
      min: 15000,
      max: 20000,
      currency: 'INR',
    },
    requirements: ['ITI Certificate', 'Relevant Trade'],
    isActive: true,
    isFeatured: false,
  },
  {
    title: 'Technical Assistant - Railway',
    jobType: 'CENTRAL',
    domain: 'Technical',
    state: 'All India',
    education: 'Graduate',
    ageMin: 21,
    ageMax: 30,
    lastDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000), // 50 days from now
    description: 'Recruitment for Technical Assistant positions in Indian Railways.',
    applicationLink: 'https://example.com/technical-assistant',
    vacancyCount: 800,
    salaryRange: {
      min: 35000,
      max: 45000,
      currency: 'INR',
    },
    requirements: ['Engineering Degree', 'Technical Aptitude Test'],
    isActive: true,
    isFeatured: false,
  },
];

const sampleSchemes = [
  {
    name: 'Pradhan Mantri Kaushal Vikas Yojana',
    type: 'CENTRAL',
    target: 'Unemployed Youth',
    benefit: 'Training',
    state: 'All India',
    ageMin: 18,
    ageMax: 35,
    description: 'Skill development training scheme for unemployed youth. Provides free training in various sectors.',
    applicationLink: 'https://example.com/pmkvy',
    eligibilityCriteria: 'Age between 18-35 years, Unemployed, Indian Citizen',
    documentsRequired: ['Aadhaar Card', 'Educational Certificates', 'Income Certificate'],
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Pradhan Mantri Mudra Yojana',
    type: 'CENTRAL',
    target: 'Entrepreneurs',
    benefit: 'Money',
    state: 'All India',
    description: 'Microfinance scheme providing loans up to 10 lakhs for small businesses and entrepreneurs.',
    applicationLink: 'https://example.com/mudra',
    eligibilityCriteria: 'Small business owners, Startups, Micro enterprises',
    documentsRequired: ['Business Plan', 'PAN Card', 'Bank Statements'],
    benefitAmount: {
      amount: 1000000,
      currency: 'INR',
      type: 'Variable',
    },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Maharashtra Yuva Karyakarta Scheme',
    type: 'STATE',
    target: 'Unemployed Youth',
    benefit: 'Money',
    state: 'Maharashtra',
    ageMin: 18,
    ageMax: 40,
    description: 'Monthly stipend of ₹5000 for unemployed youth actively seeking employment.',
    applicationLink: 'https://example.com/maharashtra-yuva',
    eligibilityCriteria: 'Age 18-40, Maharashtra resident, Unemployed for 6+ months',
    documentsRequired: ['Aadhaar Card', 'Domicile Certificate', 'Unemployment Certificate'],
    benefitAmount: {
      amount: 5000,
      currency: 'INR',
      type: 'Fixed',
    },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Delhi Skill Development Scheme',
    type: 'STATE',
    target: 'Students',
    benefit: 'Training',
    state: 'Delhi',
    ageMin: 16,
    ageMax: 30,
    description: 'Free skill development training for Delhi residents with placement assistance.',
    applicationLink: 'https://example.com/delhi-skill',
    eligibilityCriteria: 'Delhi resident, Age 16-30, 10th pass',
    documentsRequired: ['Aadhaar Card', 'Delhi Address Proof', 'Educational Certificates'],
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'UP Farmer Subsidy Scheme',
    type: 'STATE',
    target: 'Farmers',
    benefit: 'Subsidy',
    state: 'Uttar Pradesh',
    description: 'Subsidy on agricultural equipment and inputs for farmers.',
    applicationLink: 'https://example.com/up-farmer',
    eligibilityCriteria: 'UP farmer, Land ownership proof',
    documentsRequired: ['Land Documents', 'Aadhaar Card', 'Bank Account Details'],
    benefitAmount: {
      amount: 50000,
      currency: 'INR',
      type: 'Variable',
    },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Bihar Student Scholarship',
    type: 'STATE',
    target: 'Students',
    benefit: 'Money',
    state: 'Bihar',
    ageMin: 14,
    ageMax: 25,
    description: 'Monthly scholarship for meritorious students from economically weaker sections.',
    applicationLink: 'https://example.com/bihar-scholarship',
    eligibilityCriteria: 'Bihar student, 60%+ marks, Family income below 2.5 lakhs',
    documentsRequired: ['Marksheets', 'Income Certificate', 'Caste Certificate'],
    benefitAmount: {
      amount: 2000,
      currency: 'INR',
      type: 'Fixed',
    },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Gujarat Startup Subsidy',
    type: 'STATE',
    target: 'Entrepreneurs',
    benefit: 'Subsidy',
    state: 'Gujarat',
    description: 'Subsidy and support for startups in Gujarat with mentoring and funding.',
    applicationLink: 'https://example.com/gujarat-startup',
    eligibilityCriteria: 'Gujarat resident, Business less than 5 years old',
    documentsRequired: ['Business Registration', 'Business Plan', 'Bank Statements'],
    isActive: true,
    isFeatured: false,
  },
];

// Seed function
const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...\n');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Job.deleteMany({});
    await Scheme.deleteMany({});
    await UserPreference.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});
    await Device.deleteMany({});
    await OTP.deleteMany({});
    console.log('Existing data cleared.\n');

    // Seed Users
    console.log('Seeding users...');
    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`✓ Created ${createdUsers.length} users\n`);

    // Seed Jobs (need to assign createdBy)
    console.log('Seeding jobs...');
    const mainSuperAdmin = createdUsers.find(u => u.mobileNumber === '9876543210');
    if (!mainSuperAdmin) {
      throw new Error('Super admin (9876543210) not found in seeded users');
    }
    const jobsWithCreator = sampleJobs.map(job => ({
      ...job,
      createdBy: mainSuperAdmin._id,
      updatedBy: mainSuperAdmin._id,
    }));
    const createdJobs = await Job.insertMany(jobsWithCreator);
    console.log(`✓ Created ${createdJobs.length} jobs\n`);

    // Seed Schemes (need to assign createdBy)
    console.log('Seeding schemes...');
    const schemesWithCreator = sampleSchemes.map(scheme => ({
      ...scheme,
      createdBy: mainSuperAdmin._id,
      updatedBy: mainSuperAdmin._id,
    }));
    const createdSchemes = await Scheme.insertMany(schemesWithCreator);
    console.log(`✓ Created ${createdSchemes.length} schemes\n`);

    // Seed User Preferences for regular users
    console.log('Seeding user preferences...');
    const allRegularUsers = createdUsers.filter(u => u.role === 'USER');
    const userPreferences = allRegularUsers.map(user => ({
      userId: user._id,
      notificationSettings: {
        jobAlerts: true,
        schemeAlerts: true,
        reminders: true,
        pushNotifications: true,
        emailNotifications: false,
        smsNotifications: false,
      },
      filterPreferences: {
        defaultJobFilter: 'ALL',
        defaultJobType: null,
        preferredJobDomains: user.profile.preferredDomains,
      },
      language: 'en',
    }));
    await UserPreference.insertMany(userPreferences);
    console.log(`✓ Created ${userPreferences.length} user preferences\n`);

    // Seed OTP entries for all users (OTP: 123456, valid for 1 year)
    console.log('Seeding OTP entries...');
    const otpExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
    const otpEntries = createdUsers.map(user => ({
      mobileNumber: user.mobileNumber,
      otp: '123456',
      purpose: 'LOGIN',
      expiresAt: otpExpiresAt,
      attempts: 0,
      isUsed: false,
    }));
    const createdOTPs = await OTP.insertMany(otpEntries);
    console.log(`✓ Created ${createdOTPs.length} OTP entries (all use OTP: 123456)\n`);

    // Seed Device entries for users (mock FCM tokens - unique for each user)
    console.log('Seeding device entries...');
    const deviceEntries = createdUsers.map((user, index) => ({
      userId: user._id,
      fcmToken: `mock_fcm_token_${user.mobileNumber}_${Date.now()}_${index}_${Math.random().toString(36).substring(7)}`,
      platform: 'android',
      lastActiveAt: new Date(),
    }));
    const createdDevices = await Device.insertMany(deviceEntries);
    console.log(`✓ Created ${createdDevices.length} device entries\n`);

    // Seed Notifications for users
    console.log('Seeding notifications...');
    const notificationEntries = [];
    allRegularUsers.forEach((user, index) => {
      // Add 1-3 notifications per user
      const notificationCount = (index % 3) + 1;
      for (let i = 0; i < notificationCount; i++) {
        const job = createdJobs[index % createdJobs.length];
        const scheme = createdSchemes[index % createdSchemes.length];
        
        if (i === 0 && job) {
          notificationEntries.push({
            userId: user._id,
            type: 'JOB_ALERT',
            title: 'New job match',
            body: job.title || 'A new job matching your profile is available.',
            data: { jobId: job._id.toString() },
            read: i === 0 ? false : true, // First one unread
            pushSent: false,
          });
        } else if (i === 1 && scheme) {
          notificationEntries.push({
            userId: user._id,
            type: 'SCHEME_ALERT',
            title: 'New scheme match',
            body: scheme.name || 'A new scheme matching your profile is available.',
            data: { schemeId: scheme._id.toString() },
            read: true,
            pushSent: false,
          });
        } else if (job) {
          notificationEntries.push({
            userId: user._id,
            type: 'JOB_ALERT',
            title: 'Job reminder',
            body: `Don't forget to apply for: ${job.title}`,
            data: { jobId: job._id.toString() },
            read: true,
            pushSent: false,
          });
        }
      }
    });
    const createdNotifications = await Notification.insertMany(notificationEntries);
    console.log(`✓ Created ${createdNotifications.length} notifications\n`);

    // Seed Audit Logs for admin actions
    console.log('Seeding audit logs...');
    const allAdminUsers = createdUsers.filter(u => u.role === 'ADMIN');
    const superAdminForAudit = allAdminUsers.find(u => u.mobileNumber === '9876543210');
    const allSubadminUsers = allAdminUsers.filter(u => u.mobileNumber !== '9876543210');
    const auditLogEntries = [];
    
    // Create audit logs for subadmin verification
    if (superAdminForAudit) {
      allSubadminUsers.forEach(subadmin => {
        auditLogEntries.push({
          action: 'SUBADMIN_CREATED',
          performedBy: superAdminForAudit._id,
          targetUser: subadmin._id,
          details: {
            mobileNumber: subadmin.mobileNumber,
            name: subadmin.adminProfile.name,
            assignedStates: subadmin.adminProfile.assignedStates,
          },
          status: 'SUCCESS',
        });
        auditLogEntries.push({
          action: 'SUBADMIN_VERIFIED',
          performedBy: superAdminForAudit._id,
          targetUser: subadmin._id,
          details: {
            verificationStatus: 'VERIFIED',
            verifiedAt: new Date(),
          },
          status: 'SUCCESS',
        });
      });
    }
    
    const createdAuditLogs = await AuditLog.insertMany(auditLogEntries);
    console.log(`✓ Created ${createdAuditLogs.length} audit log entries\n`);

    console.log('✅ Database seeding completed successfully!');
    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    const finalAdminUsers = createdUsers.filter(u => u.role === 'ADMIN');
    const finalRegularUsers = createdUsers.filter(u => u.role === 'USER');
    const finalSuperAdmin = finalAdminUsers.find(u => u.mobileNumber === '9876543210');
    const finalSubadmins = finalAdminUsers.filter(u => u.mobileNumber !== '9876543210');
    
    console.log(`- Users: ${createdUsers.length} (1 Super Admin, ${finalSubadmins.length} Sub Admins, ${finalRegularUsers.length} Regular Users)`);
    console.log(`\n📋 ALL MOBILE NUMBERS WITH ROLES (OTP: 123456 for all):`);
    console.log(`- Jobs: ${createdJobs.length}`);
    console.log(`- Schemes: ${createdSchemes.length}`);
    console.log(`- User Preferences: ${userPreferences.length}`);
    console.log(`- OTP Entries: ${createdOTPs.length} (All use OTP: 123456 - NOT sent via Fast2SMS)`);
    console.log(`- Device Entries: ${createdDevices.length}`);
    console.log(`- Notifications: ${createdNotifications.length}`);
    console.log(`- Audit Logs: ${createdAuditLogs.length}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('LOGIN CREDENTIALS (OTP: 123456 for all numbers - Hardcoded, NO Fast2SMS)');
    console.log('='.repeat(60));
    if (finalSuperAdmin) {
      console.log('\n👑 SUPER ADMIN:');
      console.log(`  ${finalSuperAdmin.mobileNumber} - ${finalSuperAdmin.adminProfile.name} (All States, All Permissions)`);
    }
    console.log('\n📱 SUB ADMINS:');
    finalSubadmins.forEach(user => {
      console.log(`  ${user.mobileNumber} - ${user.adminProfile.name} (${user.adminProfile.assignedStates.length > 0 ? user.adminProfile.assignedStates.join(', ') : 'No States'})`);
    });
    if (finalRegularUsers.length > 0) {
      console.log('\n👤 REGULAR USERS:');
      finalRegularUsers.forEach(user => {
        console.log(`  ${user.mobileNumber} - ${user.profile.fullName} (${user.profile.state})`);
      });
    }
    console.log('\n' + '='.repeat(60));
    console.log('⚠️  IMPORTANT: OTP 123456 is HARDCODED - NO Fast2SMS SMS will be sent');
    console.log('All users (admin, subadmin, regular) can login with OTP: 123456');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// Main execution
const runSeed = async () => {
  try {
    await connectDB();
    await seedDatabase();
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed database:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  runSeed();
}

module.exports = { seedDatabase, connectDB };