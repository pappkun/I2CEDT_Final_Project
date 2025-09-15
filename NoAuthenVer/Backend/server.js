
// --- Imports & Config ---
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const { getRatingFromGemini } = require('./services/geminiService');

// --- App Setup ---
const app = express();
const port = process.env.PORT || 3222;
app.use(cors()); // Enable CORS for all origins
app.use(express.json());

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- Schemas & Models ---
const jobDescSchema = new mongoose.Schema({ desc: { type: String, required: true } }, { timestamps: true });
const JobDesc = mongoose.model('JobDesc', jobDescSchema);

const resumeSchema = new mongoose.Schema({ resume: { type: String, required: true } }, { timestamps: true });
const Resume = mongoose.model('Resume', resumeSchema);

const ratingSchema = new mongoose.Schema({
    overallscore: { type: Number, required: true },
    text: { type: String, required: true }
}, { timestamps: true });
const Rating = mongoose.model('Rating', ratingSchema);

// --- Routers ---
const jobDescRouter = express.Router();
jobDescRouter.get('/', async (req, res) => {
    try {
        const jobDescs = await JobDesc.find({}, '_id desc');
        res.json(jobDescs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch job descriptions.' });
    }
});
jobDescRouter.post('/', async (req, res) => {
    try {
        const { desc } = req.body;
        if (!desc) {
            return res.status(400).json({ error: 'Job description is required.' });
        }
        const jobDesc = new JobDesc({ desc });
        await jobDesc.save();
        res.status(200).json(jobDesc);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save job description.' });
    }
});
jobDescRouter.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedJobDesc = await JobDesc.findOneAndDelete({ _id: id });
        if (!deletedJobDesc) {
            return res.status(404).json({ error: 'Job description not found.' });
        }
        res.json({ message: 'Job description deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete job description.' });
    }
});
app.use('/jobdesc', jobDescRouter);

const resumeRouter = express.Router();
resumeRouter.get('/', async (req, res) => {
    try {
        let resumeDoc = await Resume.findOne();
        if (!resumeDoc) {
            resumeDoc = new Resume({ resume: '' });
            await resumeDoc.save();
        }
        res.json(resumeDoc);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch resume.' });
    }
});
resumeRouter.put('/', async (req, res) => {
    try {
        const { resume } = req.body;
        if (!resume) {
            return res.status(400).json({ error: 'Resume is required.' });
        }
        let resumeDoc = await Resume.findOne();
        if (resumeDoc) {
            resumeDoc.resume = resume;
            await resumeDoc.save();
        } else {
            resumeDoc = new Resume({ resume });
            await resumeDoc.save();
        }
        res.status(200).json(resumeDoc);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update resume.' });
    }
});
app.use('/resume', resumeRouter);

const ratingRouter = express.Router();
ratingRouter.get('/', async (req, res) => {
    try {
        let ratingDoc = await Rating.findOne();
        if (!ratingDoc) {
            ratingDoc = new Rating({ overallscore: 0, text: '' });
            await ratingDoc.save();
        }
        res.json(ratingDoc);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch rating.' });
    }
});
ratingRouter.put('/', async (req, res) => {
    try {
        const resumeDoc = await Resume.findOne();
        if (!resumeDoc || !resumeDoc.resume) {
            return res.status(400).json({ error: 'No resume found in database.' });
        }
        // Fetch all job descriptions
        const jobDescDocs = await JobDesc.find({}, 'desc');
        if (!jobDescDocs || jobDescDocs.length === 0) {
            return res.status(400).json({ error: 'No job descriptions found in database.' });
        }
        // Parse into array of strings
        const jobDescArray = jobDescDocs.map(doc => doc.desc);
        // Pass as a single string (joined) to Gemini
        const jobDescText = jobDescArray.join('\n---\n');
        const geminiResult = await getRatingFromGemini(resumeDoc.resume, jobDescText);
        let ratingDoc = await Rating.findOne();
        if (ratingDoc) {
            ratingDoc.overallscore = geminiResult.overallscore;
            ratingDoc.text = geminiResult.text;
            await ratingDoc.save();
        } else {
            ratingDoc = new Rating({ overallscore: geminiResult.overallscore, text: geminiResult.text });
            await ratingDoc.save();
        }
        res.json(ratingDoc);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update rating.' });
    }
});
app.use('/rating', ratingRouter);

// --- Start Server ---
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});