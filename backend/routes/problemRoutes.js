const express = require('express');
const router = express.Router();
const { getAllProblems, getProblemById, createProblem, updateProblemProgress } = require('../controllers/problemController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/adminAuth');

router.get('/', getAllProblems);
router.get('/:id', getProblemById);
router.post('/', requireAdmin, createProblem);
router.post('/:id/progress', authenticate, updateProblemProgress);

module.exports = router;
