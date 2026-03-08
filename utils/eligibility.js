/**
 * Check if user is eligible for a job.
 * Supports legacy fields (ageMin, ageMax, education, state) and extended job card
 * (eligibleStates, ageLimit, eligibilityRules) and user profile
 * (category, gender, educationEntries, jobPreference, jobTypeIds).
 * @param {Object} user - User object (with profile, possibly populated educationEntries, jobTypeIds)
 * @param {Object} job - Job object (with ageMin, ageMax, education, domain, state, eligibleStates, ageLimit, eligibilityRules)
 * @returns {Object} - { eligible: boolean, reasons: string[] }
 */
const checkJobEligibility = (user, job) => {
  const reasons = [];
  const profile = user.profile || {};
  const jobObj = job.toObject ? job.toObject() : job;

  const userAge = profile.age ?? (profile.dateOfBirth ? ageFromDOB(profile.dateOfBirth) : null);
  const ageMin = jobObj.ageLimit?.min ?? jobObj.ageMin;
  const ageMax = jobObj.ageLimit?.max ?? jobObj.ageMax;

  if (ageMin != null && ageMax != null && userAge != null) {
    let applicableMin = ageMin;
    let applicableMax = ageMax;
    if (jobObj.ageLimit && jobObj.ageLimit.sameForAll === false) {
      const gender = (profile.gender || '').toUpperCase();
      if (gender === 'MALE' && (jobObj.ageLimit.maleMin != null || jobObj.ageLimit.maleMax != null)) {
        applicableMin = jobObj.ageLimit.maleMin ?? ageMin;
        applicableMax = jobObj.ageLimit.maleMax ?? ageMax;
      } else if (gender === 'FEMALE' && (jobObj.ageLimit.femaleMin != null || jobObj.ageLimit.femaleMax != null)) {
        applicableMin = jobObj.ageLimit.femaleMin ?? ageMin;
        applicableMax = jobObj.ageLimit.femaleMax ?? ageMax;
      }
    }
    if (userAge < applicableMin || userAge > applicableMax) {
      reasons.push(`Age requirement: ${applicableMin}-${applicableMax} years (your age: ${userAge})`);
    }
  }

  const eligibleStates = jobObj.eligibleStates;
  if (eligibleStates && Array.isArray(eligibleStates) && !eligibleStates.includes('ALL')) {
    const userState = profile.domicileState || profile.state;
    if (!userState || !eligibleStates.includes(userState)) {
      reasons.push(`Eligible state: ${eligibleStates.join(', ')} (your state: ${userState || 'not set'})`);
    }
  }

  if (jobObj.jobType === 'STATE' && !eligibleStates?.includes('ALL') && jobObj.state !== 'All India') {
    const userState = profile.domicileState || profile.state;
    if (userState !== jobObj.state) {
      reasons.push(`State requirement: ${jobObj.state}`);
    }
  }

  const educationLevels = { '10th': 1, '12th': 2, 'ITI': 3, 'Graduate': 4 };
  const jobEducation = jobObj.education;
  if (jobEducation) {
    const jobEduLevel = educationLevels[jobEducation] || 0;
    const userEduLevel = educationLevels[profile.education] || 0;
    const userHasEntries = profile.educationEntries?.length > 0;
    if (!userHasEntries && userEduLevel < jobEduLevel) {
      reasons.push(`Education requirement: ${jobEducation}`);
    }
    if (userHasEntries && jobObj.eligibilityRules?.length > 0) {
      const userSatisfiesEduRules = checkEligibilityRules(profile, jobObj.eligibilityRules);
      if (!userSatisfiesEduRules) {
        reasons.push('Education/qualification does not match eligibility rules');
      }
    } else if (userHasEntries && jobEduLevel > 0) {
      const userLevels = (profile.educationEntries || []).map((e) => {
        const q = e.qualificationId?.name || e.qualificationId;
        if (typeof q === 'string') return educationLevels[q] || 0;
        return 0;
      });
      const maxUserLevel = userLevels.length ? Math.max(...userLevels) : 0;
      if (maxUserLevel < jobEduLevel) {
        reasons.push(`Education requirement: ${jobEducation}`);
      }
    }
  } else if (jobObj.eligibilityRules?.length > 0) {
    const userSatisfiesEduRules = checkEligibilityRules(profile, jobObj.eligibilityRules);
    if (!userSatisfiesEduRules) {
      reasons.push('Education/qualification does not match eligibility rules');
    }
  }

  const preferredDomains = profile.preferredDomains || [];
  if (!preferredDomains.includes('ALL') && jobObj.domain && !preferredDomains.includes(jobObj.domain)) {
    reasons.push(`Domain preference: ${jobObj.domain}`);
  }

  if (profile.jobPreference?.preferenceType === 'STATE' && profile.jobPreference?.stateIds?.length > 0) {
    const jobStates = jobObj.eligibleStates;
    if (jobStates && !jobStates.includes('ALL')) {
      const overlap = jobStates.some((s) => profile.jobPreference.stateIds.includes(s));
      if (!overlap) {
        reasons.push('Job is not in your preferred state(s)');
      }
    }
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
};

function ageFromDOB(dob) {
  const d = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

function checkEligibilityRules(profile, rules) {
  if (!rules || rules.length === 0) return true;
  const entries = profile.educationEntries || [];
  const toId = (v) => (v != null && typeof v === 'object' && v.toString ? v.toString() : v != null ? String(v) : '');
  const userQualStreams = entries.map((e) => ({
    q: toId(e.qualificationId?._id ?? e.qualificationId),
    s: toId(e.streamId?._id ?? e.streamId),
  }));

  for (const group of rules) {
    const logic = (group.logic || 'AND').toUpperCase();
    const conditions = group.conditions || [];
    if (conditions.length === 0) continue;

    const matches = conditions.map((cond) => {
      const qId = toId(cond.qualificationId?._id ?? cond.qualificationId);
      const sId = toId(cond.streamId?._id ?? cond.streamId);
      if (!qId && !sId) return true;
      return userQualStreams.some((u) => {
        const qMatch = !qId || u.q === qId;
        const sMatch = !sId || u.s === sId;
        return qMatch && sMatch;
      });
    });

    const groupOk = logic === 'OR' ? matches.some(Boolean) : matches.every(Boolean);
    if (groupOk) return true;
  }
  return false;
}

/**
 * Check if user is eligible for a scheme
 */
const checkSchemeEligibility = (user, scheme) => {
  const reasons = [];
  const profile = user.profile || {};

  if (scheme.ageMin !== undefined && scheme.ageMax !== undefined) {
    const userAge = profile.age ?? (profile.dateOfBirth ? ageFromDOB(profile.dateOfBirth) : null);
    if (userAge != null && (userAge < scheme.ageMin || userAge > scheme.ageMax)) {
      reasons.push(`Age requirement: ${scheme.ageMin}-${scheme.ageMax} years`);
    }
  }

  if (scheme.type === 'STATE' && scheme.state !== 'All India' && profile.state !== scheme.state) {
    const userState = profile.domicileState || profile.state;
    if (userState !== scheme.state) {
      reasons.push(`State requirement: ${scheme.state}`);
    }
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
