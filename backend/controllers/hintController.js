const { db } = require('../utils/firebase');
const { generateHint } = require('../services/openaiService');

// Get AI-generated hint for a problem
const getHint = async (req, res) => {
  try {
    const { problemId } = req.body;

    if (!problemId) {
      return res.status(400).json({ error: 'problemId is required' });
    }

    const doc = await db.collection('problems').doc(problemId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const problem = doc.data();

    // Try AI hint first, fall back to stored hints
    let hint;
    try {
      hint = await generateHint(problem);
    } catch {
      // Fallback to stored hints
      const hints = problem.hints || [];
      hint = hints.length > 0
        ? hints[Math.floor(Math.random() * hints.length)]
        : 'Think about the data structure that best fits this problem. Consider time and space complexity.';
    }

    res.json({ hint });
  } catch (error) {
    console.error('Hint error:', error);
    res.status(500).json({ error: 'Failed to generate hint' });
  }
};

module.exports = { getHint };
