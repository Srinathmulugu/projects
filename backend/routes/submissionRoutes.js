const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { submitSolution, getUserSubmissions, runCode } = require('../controllers/submissionController');

router.post('/submit', authenticate, submitSolution);
router.post('/run', authenticate, runCode);
router.get('/user', authenticate, getUserSubmissions);

module.exports = router;
