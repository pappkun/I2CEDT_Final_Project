// --- Job Description Section ---
const BACKEND_URL = 'http://localhost:3222'; // Change to your backend URL
const jobdescForm = document.getElementById('jobdesc-form');
const jobdescInput = document.getElementById('jobdesc-input');
const jobdescList = document.getElementById('jobdesc-list');

function fetchJobDescs() {
    fetch(`${BACKEND_URL}/jobdesc`)
        .then(res => res.json())
        .then(data => {
            jobdescList.innerHTML = '';
            data.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item.desc;
                const delBtn = document.createElement('button');
                delBtn.textContent = 'Delete';
                delBtn.className = 'delete-btn';
                delBtn.onclick = () => deleteJobDesc(item._id);
                li.appendChild(delBtn);
                jobdescList.appendChild(li);
            });
        });
}

function addJobDesc(e) {
    e.preventDefault();
    const desc = jobdescInput.value.trim();
    if (!desc) return;
    fetch(`${BACKEND_URL}/jobdesc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ desc })
    })
    .then(res => res.json())
    .then(() => {
        jobdescInput.value = '';
        fetchJobDescs();
    });
}

function deleteJobDesc(id) {
    fetch(`${BACKEND_URL}/jobdesc/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(() => fetchJobDescs());
}

jobdescForm.addEventListener('submit', addJobDesc);
document.addEventListener('DOMContentLoaded', fetchJobDescs);

// --- Resume Section ---
const resumeInput = document.getElementById('resume-input');
const resumeSaveBtn = document.getElementById('resume-save');
const resumeStatus = document.getElementById('resume-status');

function fetchResume() {
    fetch(`${BACKEND_URL}/resume`)
        .then(res => res.json())
        .then(data => {
            resumeInput.value = data.resume || '';
        });
}

function saveResume() {
    const resume = resumeInput.value.trim();
    if (!resume) return;
    fetch(`${BACKEND_URL}/resume`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume })
    })
    .then(res => res.json())
    .then(() => {
        resumeStatus.textContent = 'Resume saved!';
        setTimeout(() => resumeStatus.textContent = '', 2000);
    });
}

resumeSaveBtn.addEventListener('click', saveResume);
document.addEventListener('DOMContentLoaded', fetchResume);

// --- Rating Section ---
const rateResumeBtn = document.getElementById('rate-resume');
const ratingResult = document.getElementById('rating-result');
const ratingThrobber = document.getElementById('rating-throbber');

function renderRating(data) {
    // Score bar (0-100)
    const score = typeof data.overallscore === 'number' ? data.overallscore : 0;
    // Convert score out of 10 to percent
    const scorePercent = Math.max(0, Math.min(100, score * 10));
    const bar = `
        <div id="rating-bar">
            <div id="rating-bar-fill" style="width:${scorePercent}%"></div>
            <span id="rating-score-label">${scorePercent}</span>
        </div>
    `;
    // Feedback text
    const feedback = `<div>${data.text ? data.text : ''}</div>`;
    ratingResult.innerHTML = bar + feedback;
}

function fetchRating() {
    ratingThrobber.style.display = 'block';
    ratingResult.innerHTML = '';
    fetch(`${BACKEND_URL}/rating`)
        .then(res => res.json())
        .then(data => {
            ratingThrobber.style.display = 'none';
            renderRating(data);
        })
        .catch(() => {
            ratingThrobber.style.display = 'none';
            ratingResult.textContent = 'Failed to load rating.';
        });
}

function rateResume() {
    ratingThrobber.style.display = 'block';
    ratingResult.innerHTML = '';
    fetch(`${BACKEND_URL}/rating`, { method: 'PUT' })
        .then(res => res.json())
        .then(data => {
            ratingThrobber.style.display = 'none';
            renderRating(data);
        })
        .catch(() => {
            ratingThrobber.style.display = 'none';
            ratingResult.textContent = 'Failed to rate resume.';
        });
}

rateResumeBtn.addEventListener('click', rateResume);
document.addEventListener('DOMContentLoaded', fetchRating);
