/**
 * Check if user is eligible for a job
 * @param {Object} user - User object
 * @param {Object} job - Job object
 * @returns {Object} - { eligible: boolean, reasons: string[] }
 */
const checkJobEligibility = (user, job) => {
  const reasons = [];

  // Age check
  if (user.profile.age < job.ageMin || user.profile.age > job.ageMax) {
    reasons.push(`Age requirement: ${job.ageMin}-${job.ageMax} years`);
  }

  // Education check
  const educationLevels = { '10th': 1, '12th': 2, 'ITI': 3, 'Graduate': 4 };
  const userEducationLevel = educationLevels[user.profile.education] || 0;
  const jobEducationLevel = educationLevels[job.education] || 0;

  if (userEducationLevel < jobEducationLevel) {
    reasons.push(`Education requirement: ${job.education}`);
  }

  // Domain check
  const preferredDomains = user.profile.preferredDomains || [];
  if (!preferredDomains.includes('ALL') && !preferredDomains.includes(job.domain)) {
    reasons.push(`Domain preference: ${job.domain}`);
  }

  // State check (for STATE jobs)
  if (job.jobType === 'STATE' && job.state !== 'All India' && user.profile.state !== job.state) {
    reasons.push(`State requirement: ${job.state}`);
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
};

/**
 * Check if user is eligible for a scheme
 * @param {Object} user - User object
 * @param {Object} scheme - Scheme object
 * @returns {Object} - { eligible: boolean, reasons: string[] }
 */
const checkSchemeEligibility = (user, scheme) => {
  const reasons = [];

  // Age check (if scheme has age limits)
  if (scheme.ageMin !== undefined && scheme.ageMax !== undefined) {
    if (user.profile.age < scheme.ageMin || user.profile.age > scheme.ageMax) {
      reasons.push(`Age requirement: ${scheme.ageMin}-${scheme.ageMax} years`);
    }
  }

  // State check (for STATE schemes)
  if (scheme.type === 'STATE' && scheme.state !== 'All India' && user.profile.state !== scheme.state) {
    reasons.push(`State requirement: ${scheme.state}`);
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
};

module.exports = {
  checkJobEligibility,
  checkSchemeEligibility,
};