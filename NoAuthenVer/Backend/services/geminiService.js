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
        const prompt = `You are a professional career coach and resume reviewer.

Task: Compare the resume with the job description and provide a short and compacted analysis.

Job Description:
${jobDescText}

Resume:
${resumeText}

Instructions:
Give an overall rating from 1 to 10 based on how well the resume matches the job description.
in this format:
Score:{score}
Feedback:{brief summary of the overall impression. if score is not 10, list all mistake KEEP IT COMPACTED AND SUMMARY-LIKE}
Evaluate using these criteria:

   Positive aspects a good resume SHOULD have:
   - Include relevant keywords from the job description
   - Use quantifiable measures to demonstrate achievements
   - Show important soft skills relevant to the job

   Negative aspects a good resume SHOULD NOT have:
   - Be vague or unclear
   - Overuse technical jargon
   - Be prone to miscommunication
   - Include unrelated skills or experiences
`;
        const result = await model.generateContent(prompt);
        console.log('Gemini response:', result);
        const response = result.response.text();
        // Example response: "Score: 8\nFeedback: Well-structured resume with relevant experience."
        const scoreMatch = response.match(/Score:\s*(\d+)/i);
        const feedbackMatch = response.match(/Feedback:\s*([\s\S]*)/i);
        const overallscore = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
        const text = feedbackMatch ? feedbackMatch[1].trim() : response.trim();
        return { overallscore, text };
    } catch (error) {
        console.error('Gemini API error:', error);
        return { overallscore: 0, text: 'Error getting rating from Gemini.' };
    }
}

module.exports = { getRatingFromGemini };
