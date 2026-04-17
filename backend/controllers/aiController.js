const { db } = require('../utils/firebase');
const {
  generateStepByStepHints,
  explainSolution,
  optimizeCode,
} = require('../services/openaiService');

const fallbackAssist = (action, problem, userCode) => {
  const storedHints = problem.hints || [];

  if (action === 'hint-steps') {
    if (storedHints.length > 0) {
      return storedHints.map((hint, index) => `${index + 1}. ${hint}`).join('\n');
    }
    return '1. Start by identifying the core data structure or traversal pattern.\n2. Work through a small example manually.\n3. Look for repeated subproblems or graph relationships.\n4. Optimize only after the correct approach is clear.';
  }

  if (action === 'explain') {
    return `Problem: ${problem.title}\n\nA likely good approach is based on the topic \"${problem.topic}\". Focus on deriving the main idea first, then identify the right data structure, then reason about time and space complexity. ${userCode ? 'Your pasted solution can be explained in more detail once the OpenAI key is configured.' : 'Paste your solution or approach to get a more specific explanation when OpenAI is enabled.'}`;
  }

  if (action === 'optimize') {
    return 'Optimization suggestions require pasted code and work best when OpenAI is configured. In general, review time complexity, repeated scans, unnecessary extra memory, and whether a better data structure can reduce complexity.';
  }

  return 'Unsupported AI action.';
};

const assistProblem = async (req, res) => {
  try {
    const { problemId, action, userCode } = req.body || {};

    if (!problemId || !action) {
      return res.status(400).json({ error: 'problemId and action are required' });
    }

    const allowed = ['hint-steps', 'explain', 'optimize'];
    if (!allowed.includes(action)) {
      return res.status(400).json({ error: 'action must be one of: hint-steps, explain, optimize' });
    }

    if (action === 'optimize' && !userCode?.trim()) {
      return res.status(400).json({ error: 'Paste your code first to optimize it' });
    }

    const doc = await db.collection('problems').doc(problemId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const problem = doc.data();

    try {
      let content = '';
      if (action === 'hint-steps') {
        content = await generateStepByStepHints(problem);
      } else if (action === 'explain') {
        content = await explainSolution(problem, userCode || '');
      } else if (action === 'optimize') {
        content = await optimizeCode(problem, userCode || '');
      }

      return res.json({ content, source: 'ai' });
    } catch {
      return res.json({ content: fallbackAssist(action, problem, userCode || ''), source: 'fallback' });
    }
  } catch (error) {
    console.error('AI assistant error:', error);
    return res.status(500).json({ error: 'Failed to generate AI response' });
  }
};

module.exports = { assistProblem };