/**
 * List of mobile numbers that use hardcoded OTP 123456 (no Fast2SMS).
 * Admin panel + RojgarApp seeded users. All other numbers use Fast2SMS.
 */
const SEEDED_MOBILE_NUMBERS = [
  // Admin panel - Super Admin
  '9876543210',
  // Admin panel - Admin
  '9876543209',
  // Admin panel - Super Sub-Admin
  '9876543208',
  // Admin panel - Subadmins
  '9876543211',
  '9876543212',
  '9876543213',
  '9876543214',
  '9876543215',
  '9876543216',
  '9876543217',
  '9876543218',
  '9876543219',
  '9876543220',
  // RojgarApp - Regular users
  '9876543221',
  '9876543222',
  '9876543223',
  '9876543224',
  '9876543225',
  '9876543226',
  '9876543227',
  '9876543228',
];

/**
 * Check if a mobile number is in the seeded list (uses hardcoded OTP)
 * @param {string} mobileNumber - 10-digit mobile number
 * @returns {boolean} - True if the number uses hardcoded OTP
 */
const isSeededNumber = (mobileNumber) => {
  return SEEDED_MOBILE_NUMBERS.includes(mobileNumber);
};

module.exports = {
  SEEDED_MOBILE_NUMBERS,
  isSeededNumber,
};
