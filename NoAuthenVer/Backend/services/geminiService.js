const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Calls Gemini API to rate a resume and return score and feedback.
 * @param {string} resumeText - The resume text to rate.
 * @returns {Promise<{ overallscore: number, text: string }>} - Rating and feedback.
 */
/**
 * Calls Gemini API to rate a resume and return score and feedback.
 * @param {string} resumeText - The resume text to rate.
 * @param {string} jobDescText - The job description text.
 * @returns {Promise<{ overallscore: number, text: string }>} - Rating and feedback.
 */
async function getRatingFromGemini(resumeText, jobDescText) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const prompt = `Rate the following resume for the following job description on a scale of 1-10 and provide a brief feedback in this following structure \`\`\`Score:{score}\nFeedback:{full text feedback}\`\`\`.\nJob Description:\n${jobDescText}\nResume:\n${resumeText}`;
        const result = await model.generateContent(prompt);
        console.log('Gemini response:', result);
        const response = result.response.text();
        // Example response: "Score: 8\nFeedback: Well-structured resume with relevant experience."
        const scoreMatch = response.match(/Score:\s*(\d+)/i);
        const feedbackMatch = response.match(/Feedback:\s*(.*)/i);
        const overallscore = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
        const text = feedbackMatch ? feedbackMatch[1].trim() : response.trim();
        return { overallscore, text };
    } catch (error) {
        console.error('Gemini API error:', error);
        return { overallscore: 0, text: 'Error getting rating from Gemini.' };
    }
}

module.exports = { getRatingFromGemini };