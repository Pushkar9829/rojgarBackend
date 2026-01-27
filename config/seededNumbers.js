/**
 * List of mobile numbers that use hardcoded OTP 123456
 * These are the numbers from the seed database script
 * All other numbers will use Fast2SMS for OTP delivery
 */
const SEEDED_MOBILE_NUMBERS = [
  // Super Admin
  '9876543210',
  // Sub Admins
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
  // Regular Users
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
