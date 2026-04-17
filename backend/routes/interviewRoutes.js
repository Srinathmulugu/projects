const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { startInterview } = require('../controllers/interviewController');

router.get('/start', authenticate, startInterview);

module.exports = router;
