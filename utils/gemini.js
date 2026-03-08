/**
 * Gemini API for "Ask more" job-related Q&A.
 * Set GEMINI_API_KEY in .env (get from https://aistudio.google.com/apikey).
 */
let genAI = null;

function getClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set');
  }
  if (!genAI) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

/**
 * Generate a text response for a user question about a job.
 * @param {Object} job - Job document or plain object (title, description, dates, applicationLink, etc.)
 * @param {string} question - User's question
 * @returns {Promise<string>} - Model response text
 */
async function askAboutJob(job, question) {
  const jobObj = job.toObject ? job.toObject() : job;
  const parts = [];
  parts.push(`Job title: ${jobObj.title || 'N/A'}`);
  if (jobObj.description) parts.push(`Description: ${jobObj.description}`);
  if (jobObj.domain) parts.push(`Domain: ${jobObj.domain}`);
  if (jobObj.education) parts.push(`Education required: ${jobObj.education}`);
  if (jobObj.ageMin != null && jobObj.ageMax != null) {
    parts.push(`Age range: ${jobObj.ageMin}-${jobObj.ageMax} years`);
  }
  if (jobObj.lastDate) {
    parts.push(`Last date to apply: ${new Date(jobObj.lastDate).toLocaleDateString()}`);
  }
  if (jobObj.dates?.length) {
    const dateLines = jobObj.dates
      .filter((d) => d.label || d.date)
      .map((d) => `${d.label || 'Date'}: ${d.date ? new Date(d.date).toLocaleDateString() : ''} ${d.time || ''}`.trim());
    if (dateLines.length) parts.push('Important dates:\n' + dateLines.join('\n'));
  }
  if (jobObj.applicationLink) parts.push(`Apply at: ${jobObj.applicationLink}`);
  if (jobObj.sourceLink) parts.push(`Official notification: ${jobObj.sourceLink}`);
  if (jobObj.misc) parts.push(`Additional info: ${jobObj.misc}`);

  const context = parts.join('\n');
  const client = getClient();
  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `You are a helpful assistant for a government job portal. Answer the user's question based ONLY on the following job details. If the answer is not in the details, say so briefly. Keep the answer concise and relevant.\n\nJob details:\n${context}\n\nUser question: ${question}\n\nAnswer:`;
  const result = await model.generateContent(prompt);
  const response = result.response;
  if (!response || !response.text) {
    return 'Sorry, I could not generate an answer. Please try again.';
  }
  return response.text().trim();
}

module.exports = {
  askAboutJob,
};
