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
const Qualification = require('../models/Qualification');
const Stream = require('../models/Stream');
const SkillCertificate = require('../models/SkillCertificate');
const JobType = require('../models/JobType');

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

// --- Master data (seeded first; IDs used in User & Job) ---
const sampleQualifications = [
  { name: '10th', order: 1 },
  { name: '12th', order: 2 },
  { name: 'ITI', order: 3 },
  { name: 'Graduate', order: 4 },
  { name: 'Post Graduate', order: 5 },
  { name: 'Diploma', order: 6 },
];

const sampleStreams = [
  { name: 'Arts', order: 1 },
  { name: 'Science', order: 2 },
  { name: 'Commerce', order: 3 },
  { name: 'Engineering', order: 4 },
  { name: 'General', order: 5 },
];

const sampleSkillCertificates = [
  { name: 'Driving License', order: 1 },
  { name: 'MS Office', order: 2 },
  { name: 'Tally', order: 3 },
  { name: 'Nursing Certificate', order: 4 },
  { name: 'B.Ed', order: 5 },
  { name: 'CTET', order: 6 },
  { name: 'Typing (English)', order: 7 },
  { name: 'Typing (Hindi)', order: 8 },
];

const sampleJobTypes = [
  { name: 'Central Government', code: 'CENTRAL', requiresHeight: false, order: 1 },
  { name: 'State Government', code: 'STATE', requiresHeight: false, order: 2 },
  { name: 'Defence', code: 'DEFENCE', requiresHeight: true, order: 3 },
  { name: 'Police', code: 'POLICE', requiresHeight: true, order: 4 },
  { name: 'Railway', code: 'RAILWAY', requiresHeight: false, order: 5 },
];

// Build sample users (after master data created - pass IDs)
function buildSampleUsers(createdQualifications, createdStreams, createdSkills, createdJobTypes) {
  const qual10 = createdQualifications.find(q => q.name === '10th');
  const qual12 = createdQualifications.find(q => q.name === '12th');
  const qualGrad = createdQualifications.find(q => q.name === 'Graduate');
  const streamArts = createdStreams.find(s => s.name === 'Arts');
  const streamSci = createdStreams.find(s => s.name === 'Science');
  const streamCommerce = createdStreams.find(s => s.name === 'Commerce');
  const streamGen = createdStreams.find(s => s.name === 'General');
  const jobTypeCentral = createdJobTypes.find(j => j.code === 'CENTRAL');
  const jobTypeState = createdJobTypes.find(j => j.code === 'STATE');
  const jobTypeDefence = createdJobTypes.find(j => j.code === 'DEFENCE');

  // Minimal profile for admin roles so profileComplete is true (authController also treats admin roles as complete)
  const adminProfileMinimal = (name) => ({
    fullName: name,
    education: 'Graduate',
    state: 'All India',
    district: 'N/A',
  });

  return [
    {
      mobileNumber: '9876543210',
      role: 'SUPER_ADMIN',
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
      profile: adminProfileMinimal('Super Admin'),
    },
    {
      mobileNumber: '9876543209',
      role: 'ADMIN',
      adminProfile: {
        name: 'Admin User',
        email: 'admin2@rojgaalert.com',
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
      profile: adminProfileMinimal('Admin User'),
    },
    {
      mobileNumber: '9876543208',
      role: 'SUPER_SUBADMIN',
      adminProfile: {
        name: 'Super Sub Admin',
        email: 'supersub@rojgaalert.com',
        permissions: [
          'CREATE_JOBS',
          'EDIT_JOBS',
          'DELETE_JOBS',
          'CREATE_SCHEMES',
          'EDIT_SCHEMES',
          'VIEW_USERS',
        ],
        assignedStates: ['Maharashtra', 'Gujarat'],
        verificationStatus: 'VERIFIED',
      },
      profile: adminProfileMinimal('Super Sub Admin'),
    },
    {
      mobileNumber: '9876543211',
      role: 'SUBADMIN',
      adminProfile: {
        name: 'Sub Admin - Mumbai',
        email: 'subadmin.mumbai@rojgaalert.com',
        permissions: ['CREATE_JOBS', 'EDIT_JOBS', 'CREATE_SCHEMES', 'EDIT_SCHEMES', 'VIEW_USERS'],
        assignedStates: ['Maharashtra'],
        verificationStatus: 'VERIFIED',
      },
      profile: adminProfileMinimal('Sub Admin - Mumbai'),
    },
    { mobileNumber: '9876543212', role: 'SUBADMIN', adminProfile: { name: 'Sub Admin - New Delhi', email: 'subadmin.newdelhi@rojgaalert.com', permissions: ['CREATE_JOBS', 'EDIT_JOBS', 'CREATE_SCHEMES', 'VIEW_USERS'], assignedStates: ['Delhi'], verificationStatus: 'VERIFIED' }, profile: adminProfileMinimal('Sub Admin - New Delhi') },
    { mobileNumber: '9876543213', role: 'SUBADMIN', adminProfile: { name: 'Sub Admin - Uttar Pradesh', email: 'subadmin.up@rojgaalert.com', permissions: ['CREATE_JOBS', 'EDIT_JOBS', 'CREATE_SCHEMES', 'EDIT_SCHEMES', 'VIEW_USERS'], assignedStates: ['Uttar Pradesh'], verificationStatus: 'VERIFIED' }, profile: adminProfileMinimal('Sub Admin - Uttar Pradesh') },
    { mobileNumber: '9876543214', role: 'SUBADMIN', adminProfile: { name: 'Sub Admin - Bihar', email: 'subadmin.bihar@rojgaalert.com', permissions: ['CREATE_JOBS', 'EDIT_JOBS', 'CREATE_SCHEMES', 'VIEW_USERS'], assignedStates: ['Bihar'], verificationStatus: 'VERIFIED' }, profile: adminProfileMinimal('Sub Admin - Bihar') },
    { mobileNumber: '9876543215', role: 'SUBADMIN', adminProfile: { name: 'Sub Admin - Gujarat', email: 'subadmin.gujarat@rojgaalert.com', permissions: ['CREATE_JOBS', 'EDIT_JOBS', 'CREATE_SCHEMES', 'EDIT_SCHEMES', 'VIEW_USERS'], assignedStates: ['Gujarat'], verificationStatus: 'VERIFIED' }, profile: adminProfileMinimal('Sub Admin - Gujarat') },
    { mobileNumber: '9876543216', role: 'SUBADMIN', adminProfile: { name: 'Sub Admin - Maharashtra', email: 'subadmin.mh@rojgaalert.com', permissions: ['CREATE_JOBS', 'EDIT_JOBS', 'CREATE_SCHEMES', 'EDIT_SCHEMES', 'VIEW_USERS'], assignedStates: ['Maharashtra'], verificationStatus: 'VERIFIED' }, profile: adminProfileMinimal('Sub Admin - Maharashtra') },
    { mobileNumber: '9876543217', role: 'SUBADMIN', adminProfile: { name: 'Sub Admin - Delhi', email: 'subadmin.del@rojgaalert.com', permissions: ['CREATE_JOBS', 'EDIT_JOBS', 'CREATE_SCHEMES', 'VIEW_USERS'], assignedStates: ['Delhi'], verificationStatus: 'VERIFIED' }, profile: adminProfileMinimal('Sub Admin - Delhi') },
    { mobileNumber: '9876543218', role: 'SUBADMIN', adminProfile: { name: 'Sub Admin - Pune', email: 'subadmin.pune@rojgaalert.com', permissions: ['CREATE_JOBS', 'EDIT_JOBS', 'CREATE_SCHEMES', 'VIEW_USERS'], assignedStates: ['Maharashtra'], verificationStatus: 'VERIFIED' }, profile: adminProfileMinimal('Sub Admin - Pune') },
    { mobileNumber: '9876543219', role: 'SUBADMIN', adminProfile: { name: 'Sub Admin - Kanpur', email: 'subadmin.kanpur@rojgaalert.com', permissions: ['CREATE_JOBS', 'EDIT_JOBS', 'VIEW_USERS'], assignedStates: ['Uttar Pradesh'], verificationStatus: 'VERIFIED' }, profile: adminProfileMinimal('Sub Admin - Kanpur') },
    { mobileNumber: '9876543220', role: 'SUBADMIN', adminProfile: { name: 'Sub Admin - Kerala', email: 'subadmin.kerala@rojgaalert.com', permissions: ['CREATE_JOBS', 'EDIT_JOBS', 'CREATE_SCHEMES', 'EDIT_SCHEMES', 'VIEW_USERS'], assignedStates: ['Kerala'], verificationStatus: 'VERIFIED' }, profile: adminProfileMinimal('Sub Admin - Kerala') },
  // Regular Users (extended profile with educationEntries, skillsCertificates, jobTypeIds, category, gender, domicile, jobPreference)
  {
    mobileNumber: '9876543221',
    role: 'USER',
    profile: {
      fullName: 'Rahul Kumar',
      dateOfBirth: new Date('1998-05-15'),
      education: 'Graduate',
      educationEntries: qualGrad && streamArts ? [{ qualificationId: qualGrad._id, streamId: streamArts._id, passingYear: 2019 }] : undefined,
      state: 'Maharashtra',
      district: 'Mumbai',
      category: 'GEN',
      gender: 'MALE',
      domicileState: 'Maharashtra',
      skillsCertificates: createdSkills && createdSkills.length ? [createdSkills[0]._id, createdSkills[1]._id] : [],
      jobPreference: { preferenceType: 'STATE', stateIds: ['Maharashtra'] },
      jobTypeIds: jobTypeState && jobTypeCentral ? [jobTypeState._id, jobTypeCentral._id] : [],
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
      educationEntries: qual12 && streamCommerce ? [{ qualificationId: qual12._id, streamId: streamCommerce._id, passingYear: 2018 }] : qual12 && streamArts ? [{ qualificationId: qual12._id, streamId: streamArts._id, passingYear: 2018 }] : undefined,
      state: 'Delhi',
      district: 'New Delhi',
      category: 'GEN_EWS',
      gender: 'FEMALE',
      domicileState: 'Delhi',
      skillsCertificates: createdSkills && createdSkills.length > 2 ? [createdSkills[2]._id] : [],
      jobPreference: { preferenceType: 'INDIA' },
      jobTypeIds: jobTypeState ? [jobTypeState._id] : [],
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
      educationEntries: createdQualifications && createdQualifications.length > 2 ? [{ qualificationId: createdQualifications[2]._id, streamId: streamGen ? streamGen._id : null, passingYear: 2014 }] : undefined,
      state: 'Uttar Pradesh',
      district: 'Lucknow',
      category: 'BC',
      gender: 'MALE',
      domicileState: 'Uttar Pradesh',
      skillsCertificates: [],
      jobPreference: { preferenceType: 'STATE', stateIds: ['Uttar Pradesh'] },
      jobTypeIds: jobTypeCentral ? [jobTypeCentral._id] : [],
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
      educationEntries: qual10 && streamGen ? [{ qualificationId: qual10._id, streamId: streamGen._id, passingYear: 2017 }] : undefined,
      state: 'Bihar',
      district: 'Patna',
      category: 'SC',
      gender: 'FEMALE',
      domicileState: 'Bihar',
      skillsCertificates: createdSkills && createdSkills.length > 3 ? [createdSkills[3]._id] : [],
      jobPreference: { preferenceType: 'INDIA' },
      jobTypeIds: [],
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
      educationEntries: qualGrad && streamSci ? [{ qualificationId: qualGrad._id, streamId: streamSci._id, passingYear: 2019 }] : undefined,
      state: 'Gujarat',
      district: 'Ahmedabad',
      category: 'GEN',
      gender: 'MALE',
      domicileState: 'Gujarat',
      height: 168,
      skillsCertificates: [],
      jobPreference: { preferenceType: 'STATE', stateIds: ['Gujarat', 'Maharashtra'] },
      jobTypeIds: jobTypeDefence && jobTypeState ? [jobTypeDefence._id, jobTypeState._id] : [],
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
      educationEntries: qualGrad && streamArts ? [{ qualificationId: qualGrad._id, streamId: streamArts._id, passingYear: 2018 }] : undefined,
      state: 'Maharashtra',
      district: 'Pune',
      category: 'GEN',
      gender: 'FEMALE',
      domicileState: 'Maharashtra',
      skillsCertificates: createdSkills && createdSkills.length > 4 ? [createdSkills[4]._id, createdSkills[5]._id] : [],
      jobPreference: { preferenceType: 'STATE', stateIds: ['Maharashtra'] },
      jobTypeIds: jobTypeState ? [jobTypeState._id] : [],
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
      educationEntries: qual12 && streamCommerce ? [{ qualificationId: qual12._id, streamId: streamCommerce._id, passingYear: 2012 }] : qual12 && streamArts ? [{ qualificationId: qual12._id, streamId: streamArts._id, passingYear: 2012 }] : undefined,
      state: 'Uttar Pradesh',
      district: 'Kanpur',
      category: 'BC',
      gender: 'MALE',
      domicileState: 'Uttar Pradesh',
      skillsCertificates: createdSkills && createdSkills.length > 6 ? [createdSkills[6]._id] : [],
      jobPreference: { preferenceType: 'INDIA' },
      jobTypeIds: jobTypeCentral && jobTypeState ? [jobTypeCentral._id, jobTypeState._id] : [],
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
      educationEntries: qual10 && streamGen ? [{ qualificationId: qual10._id, streamId: streamGen._id, passingYear: 2019 }] : undefined,
      state: 'Kerala',
      district: 'Kochi',
      category: 'GEN',
      gender: 'FEMALE',
      domicileState: 'Kerala',
      skillsCertificates: [],
      jobPreference: { preferenceType: 'STATE', stateIds: ['Kerala'] },
      jobTypeIds: [],
      preferredDomains: ['Clerk', 'Apprentice'],
    },
  },
  ];
}

function buildSampleJobs(createdQualifications, createdStreams, createdBy) {
  const qual10 = createdQualifications.find(q => q.name === '10th');
  const qual12 = createdQualifications.find(q => q.name === '12th');
  const qualGrad = createdQualifications.find(q => q.name === 'Graduate');
  const qualITI = createdQualifications.find(q => q.name === 'ITI');
  const streamGen = createdStreams.find(s => s.name === 'General');
  const streamArts = createdStreams.find(s => s.name === 'Arts');
  const base = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000);
  const jobBase = (title, jobType, domain, state, education, ageMin, ageMax, days, desc, link, vacancy, salaryMin, salaryMax, reqs, featured) => ({
    title,
    jobType,
    domain,
    state,
    education,
    ageMin,
    ageMax,
    lastDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    description: desc,
    applicationLink: link,
    vacancyCount: vacancy,
    salaryRange: { min: salaryMin, max: salaryMax, currency: 'INR' },
    requirements: reqs,
    isActive: true,
    isFeatured: !!featured,
    createdBy,
    updatedBy: createdBy,
    status: 'APPROVED',
    dates: [
      { label: 'Application Start', date: new Date(), time: '00:00' },
      { label: 'Last Date', date: new Date(Date.now() + days * 24 * 60 * 60 * 1000), time: '23:59' },
    ],
    eligibleStates: state === 'All India' ? [] : [state],
    ageLimit: { sameForAll: true, min: ageMin, max: ageMax },
    vacancySeats: [{ postName: title.slice(0, 30), totalSeats: vacancy }],
    misc: '',
    sourceLink: link,
  });
  const jobs = [
    {
      ...jobBase('Constable Recruitment - Maharashtra Police', 'STATE', 'Police', 'Maharashtra', '12th', 18, 28, 90, 'Recruitment for Constable position in Maharashtra Police Force. Physical fitness test required.', 'https://example.com/police-recruitment', 5000, 25000, 35000, ['Physical Fitness Test', 'Written Examination', 'Medical Test'], true),
      eligibilityRules: qual12 && streamGen ? [{ logic: 'AND', conditions: [{ qualificationId: qual12._id, streamId: streamGen._id }] }] : [],
    },
    {
      ...jobBase('Railway Group D Recruitment', 'CENTRAL', 'Railway', 'All India', '10th', 18, 33, 60, 'Indian Railways Group D recruitment for various posts across India.', 'https://example.com/railway-recruitment', 10000, 18000, 22000, ['10th Pass', 'Physical Test'], true),
      eligibleStates: [],
      eligibilityRules: qual10 && streamGen ? [{ logic: 'AND', conditions: [{ qualificationId: qual10._id, streamId: streamGen._id }] }] : [],
    },
    {
      ...jobBase('Indian Army Soldier Recruitment', 'CENTRAL', 'Defence', 'All India', '10th', 17, 23, 45, 'Recruitment for Soldier (General Duty) in Indian Army.', 'https://example.com/army-recruitment', 50000, 30000, 40000, ['Physical Fitness', 'Medical Examination', 'Written Test'], true),
      eligibleStates: [],
      eligibilityRules: qual10 ? [{ logic: 'AND', conditions: [{ qualificationId: qual10._id, streamId: null }] }] : [],
    },
    {
      ...jobBase('Primary Teacher Recruitment - Delhi', 'STATE', 'Teaching', 'Delhi', 'Graduate', 21, 35, 30, 'Recruitment for Primary Teacher position in Delhi Government Schools.', 'https://example.com/teacher-recruitment', 2000, 35000, 45000, ['Graduate with B.Ed', 'CTET Qualified'], false),
      eligibilityRules: qualGrad && streamArts ? [{ logic: 'AND', conditions: [{ qualificationId: qualGrad._id, streamId: streamArts._id }] }] : [],
    },
    {
      ...jobBase('Staff Nurse Recruitment - UP Health', 'STATE', 'Health', 'Uttar Pradesh', '12th', 18, 35, 75, 'Recruitment for Staff Nurse positions in UP Health Department.', 'https://example.com/nurse-recruitment', 3000, 28000, 35000, ['12th with Nursing Diploma', 'Registration Certificate'], false),
      eligibilityRules: qual12 ? [{ logic: 'AND', conditions: [{ qualificationId: qual12._id, streamId: null }] }] : [],
    },
    {
      ...jobBase('Junior Clerk - Bihar Secretariat', 'STATE', 'Clerk', 'Bihar', 'Graduate', 21, 37, 60, 'Recruitment for Junior Clerk positions in Bihar Secretariat.', 'https://example.com/clerk-recruitment', 1500, 22000, 30000, ['Graduate', 'Typing Speed Test'], false),
      eligibilityRules: qualGrad ? [{ logic: 'AND', conditions: [{ qualificationId: qualGrad._id, streamId: null }] }] : [],
    },
    {
      ...jobBase('ITI Apprentice - Central Government', 'CENTRAL', 'Apprentice', 'All India', 'ITI', 18, 25, 20, 'Apprenticeship opportunities for ITI candidates in various central government departments.', 'https://example.com/apprentice', 5000, 15000, 20000, ['ITI Certificate', 'Relevant Trade'], false),
      eligibleStates: [],
      eligibilityRules: qualITI ? [{ logic: 'AND', conditions: [{ qualificationId: qualITI._id, streamId: null }] }] : [],
    },
    {
      ...jobBase('Technical Assistant - Railway', 'CENTRAL', 'Technical', 'All India', 'Graduate', 21, 30, 50, 'Recruitment for Technical Assistant positions in Indian Railways.', 'https://example.com/technical-assistant', 800, 35000, 45000, ['Engineering Degree', 'Technical Aptitude Test'], false),
      eligibleStates: [],
      eligibilityRules: qualGrad ? [{ logic: 'AND', conditions: [{ qualificationId: qualGrad._id, streamId: null }] }] : [],
    },
  ];
  return jobs;
}

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

    // Clear existing data (order: dependents first, then master)
    console.log('Clearing existing data...');
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});
    await Device.deleteMany({});
    await OTP.deleteMany({});
    await UserPreference.deleteMany({});
    await Job.deleteMany({});
    await Scheme.deleteMany({});
    await User.deleteMany({});
    await Qualification.deleteMany({});
    await Stream.deleteMany({});
    await SkillCertificate.deleteMany({});
    await JobType.deleteMany({});
    console.log('Existing data cleared.\n');

    // Seed Master Data first
    console.log('Seeding qualifications...');
    const createdQualifications = await Qualification.insertMany(sampleQualifications);
    console.log(`✓ Created ${createdQualifications.length} qualifications\n`);

    console.log('Seeding streams...');
    const createdStreams = await Stream.insertMany(sampleStreams);
    console.log(`✓ Created ${createdStreams.length} streams\n`);

    console.log('Seeding skills & certificates...');
    const createdSkillCertificates = await SkillCertificate.insertMany(sampleSkillCertificates);
    console.log(`✓ Created ${createdSkillCertificates.length} skills/certificates\n`);

    console.log('Seeding job types...');
    const createdJobTypes = await JobType.insertMany(sampleJobTypes);
    console.log(`✓ Created ${createdJobTypes.length} job types\n`);

    // Seed Users (with refs to master data)
    console.log('Seeding users...');
    const sampleUsers = buildSampleUsers(createdQualifications, createdStreams, createdSkillCertificates, createdJobTypes);
    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`✓ Created ${createdUsers.length} users\n`);

    // Seed Jobs (extended fields + refs to qualifications/streams)
    console.log('Seeding jobs...');
    const mainSuperAdmin = createdUsers.find(u => u.mobileNumber === '9876543210');
    if (!mainSuperAdmin) {
      throw new Error('Super admin (9876543210) not found in seeded users');
    }
    const sampleJobs = buildSampleJobs(createdQualifications, createdStreams, mainSuperAdmin._id);
    const createdJobs = await Job.insertMany(sampleJobs);
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
    // Note: playerId is omitted to avoid duplicate key errors with null values
    console.log('Seeding device entries...');
    
    // Try to drop unique index on playerId if it exists (to allow multiple nulls)
    try {
      await Device.collection.dropIndex('playerId_1');
      console.log('  Dropped existing unique index on playerId\n');
    } catch (error) {
      // Index doesn't exist or can't be dropped - continue
      if (error.code !== 27 && error.code !== 85) { // 27 = IndexNotFound, 85 = IndexOptionsConflict
        console.log('  Note: Could not drop playerId index (this is OK if it doesn\'t exist)\n');
      }
    }
    
    const deviceEntries = createdUsers.map((user, index) => {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      return {
        userId: user._id,
        fcmToken: `mock_fcm_token_${user.mobileNumber}_${timestamp}_${index}_${random}`,
        platform: 'android',
        lastActiveAt: new Date(),
        // playerId is intentionally omitted - it's optional and causes duplicate key errors when null
      };
    });
    
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
    const allSubadminUsers = createdUsers.filter(u => u.role === 'SUBADMIN');
    const superAdminForAudit = createdUsers.find(u => u.mobileNumber === '9876543210');
    const auditLogEntries = [];
    
    // Create audit logs for subadmin verification
    const allSuperSubadmins = createdUsers.filter(u => u.role === 'SUPER_SUBADMIN');
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
      allSuperSubadmins.forEach(superSub => {
        auditLogEntries.push({
          action: 'SUPER_SUBADMIN_CREATED',
          performedBy: superAdminForAudit._id,
          targetUser: superSub._id,
          details: {
            mobileNumber: superSub.mobileNumber,
            name: superSub.adminProfile.name,
            assignedStates: superSub.adminProfile.assignedStates,
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
    const finalSuperAdminUsers = createdUsers.filter(u => u.role === 'SUPER_ADMIN');
    const finalAdminUsers = createdUsers.filter(u => u.role === 'ADMIN');
    const finalSuperSubadmins = createdUsers.filter(u => u.role === 'SUPER_SUBADMIN');
    const finalSubadminUsers = createdUsers.filter(u => u.role === 'SUBADMIN');
    const finalRegularUsers = createdUsers.filter(u => u.role === 'USER');
    const superAdminUser = createdUsers.find(u => u.mobileNumber === '9876543210');

    console.log(`- Qualifications: ${createdQualifications.length}`);
    console.log(`- Streams: ${createdStreams.length}`);
    console.log(`- Skills/Certificates: ${createdSkillCertificates.length}`);
    console.log(`- Job Types: ${createdJobTypes.length}`);
    console.log(`- Users: ${createdUsers.length} (${finalSuperAdminUsers.length} Super Admin, ${finalAdminUsers.length} Admin, ${finalSuperSubadmins.length} Super Sub-Admin, ${finalSubadminUsers.length} Sub-Admin, ${finalRegularUsers.length} Users)`);
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
    if (superAdminUser) {
      console.log('\n👑 SUPER ADMIN:');
      console.log(`  ${superAdminUser.mobileNumber} - ${superAdminUser.adminProfile.name} (All States, All Permissions)`);
    }
    if (finalAdminUsers.length) {
      console.log('\n🔐 ADMINS:');
      finalAdminUsers.forEach(user => {
        console.log(`  ${user.mobileNumber} - ${user.adminProfile.name}`);
      });
    }
    if (finalSuperSubadmins.length) {
      console.log('\n📋 SUPER SUB-ADMINS:');
      finalSuperSubadmins.forEach(user => {
        console.log(`  ${user.mobileNumber} - ${user.adminProfile.name} (${user.adminProfile.assignedStates.length ? user.adminProfile.assignedStates.join(', ') : 'No States'})`);
      });
    }
    console.log('\n📱 SUB ADMINS:');
    finalSubadminUsers.forEach(user => {
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