require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Job = require('../models/Job');
const Scheme = require('../models/Scheme');
const UserPreference = require('../models/UserPreference');

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
      name: 'Admin User',
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
    },
  },
  {
    mobileNumber: '9876543211',
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
    mobileNumber: '9876543212',
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
    mobileNumber: '9876543213',
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
    mobileNumber: '9876543214',
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
    mobileNumber: '9876543215',
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
    lastDate: new Date('2024-12-31'),
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
    lastDate: new Date('2024-11-30'),
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
    lastDate: new Date('2024-10-31'),
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
    lastDate: new Date('2024-11-15'),
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
    lastDate: new Date('2024-12-20'),
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
    lastDate: new Date('2024-11-30'),
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
    lastDate: new Date('2024-10-15'),
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
    lastDate: new Date('2024-12-10'),
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
    console.log('Existing data cleared.\n');

    // Seed Users
    console.log('Seeding users...');
    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`✓ Created ${createdUsers.length} users\n`);

    // Seed Jobs (need to assign createdBy)
    console.log('Seeding jobs...');
    const adminUser = createdUsers.find(u => u.role === 'ADMIN');
    const jobsWithCreator = sampleJobs.map(job => ({
      ...job,
      createdBy: adminUser._id,
      updatedBy: adminUser._id,
    }));
    const createdJobs = await Job.insertMany(jobsWithCreator);
    console.log(`✓ Created ${createdJobs.length} jobs\n`);

    // Seed Schemes (need to assign createdBy)
    console.log('Seeding schemes...');
    const schemesWithCreator = sampleSchemes.map(scheme => ({
      ...scheme,
      createdBy: adminUser._id,
      updatedBy: adminUser._id,
    }));
    const createdSchemes = await Scheme.insertMany(schemesWithCreator);
    console.log(`✓ Created ${createdSchemes.length} schemes\n`);

    // Seed User Preferences for regular users
    console.log('Seeding user preferences...');
    const regularUsers = createdUsers.filter(u => u.role === 'USER');
    const userPreferences = regularUsers.map(user => ({
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

    console.log('✅ Database seeding completed successfully!');
    console.log('\nSummary:');
    console.log(`- Users: ${createdUsers.length} (${createdUsers.filter(u => u.role === 'ADMIN').length} admin, ${createdUsers.filter(u => u.role === 'USER').length} regular)`);
    console.log(`- Jobs: ${createdJobs.length}`);
    console.log(`- Schemes: ${createdSchemes.length}`);
    console.log(`- User Preferences: ${userPreferences.length}`);
    console.log('\nAdmin Login Credentials:');
    console.log(`Mobile: 9876543210`);
    console.log(`Role: ADMIN`);

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