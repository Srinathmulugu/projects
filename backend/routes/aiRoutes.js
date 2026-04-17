const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { assistProblem } = require('../controllers/aiController');

router.post('/assist', authenticate, assistProblem);

module.exports = router;