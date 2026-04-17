const { db, admin } = require('../utils/firebase');
const fallbackProblems = require('../models/defaultProblems');

const requiredFields = ['title', 'difficulty', 'topic', 'description'];

const normalizeTopic = (topic) => {
  const value = (topic || '').trim();
  if (!value) return 'General';
  if (value.toLowerCase() === 'array') return 'Arrays';
  if (value.toLowerCase() === 'string') return 'Strings';
  return value;
};

const matchesQuery = (problem, difficulty, topic) => {
  if (difficulty && problem.difficulty !== difficulty) return false;
  if (topic && normalizeTopic(problem.topic) !== normalizeTopic(topic)) return false;
  return true;
};

const getFallbackProblems = (difficulty, topic) =>
  fallbackProblems
    .filter((problem) => matchesQuery(problem, difficulty, topic))
    .map((problem) => ({ ...problem, topic: normalizeTopic(problem.topic) }));

// Get all problems with optional filters
const getAllProblems = async (req, res) => {
  try {
    const { difficulty, topic } = req.query;

    if (!db) {
      return res.json(getFallbackProblems(difficulty, topic));
    }

    let query = db.collection('problems');

    if (difficulty) {
      query = query.where('difficulty', '==', difficulty);
    }
    if (topic) {
      query = query.where('topic', '==', topic);
    }

    const snapshot = await query.get();
    const problems = [];
    snapshot.forEach((doc) => {
      problems.push({ id: doc.id, ...doc.data(), topic: normalizeTopic(doc.data().topic) });
    });

    if (problems.length === 0 && fallbackProblems.length > 0) {
      return res.json(getFallbackProblems(difficulty, topic));
    }

    res.json(problems);
  } catch (error) {
    console.error('Get problems error:', error);
    const { difficulty, topic } = req.query;
    res.json(getFallbackProblems(difficulty, topic));
  }
};

// Get single problem by ID
const getProblemById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!db) {
      const fallbackProblem = fallbackProblems.find((problem) => problem.id === id);
      if (!fallbackProblem) {
        return res.status(404).json({ error: 'Problem not found' });
      }

      return res.json({ ...fallbackProblem, topic: normalizeTopic(fallbackProblem.topic) });
    }

    const doc = await db.collection('problems').doc(id).get();

    if (!doc.exists) {
      const fallbackProblem = fallbackProblems.find((problem) => problem.id === id);
      if (fallbackProblem) {
        return res.json({ ...fallbackProblem, topic: normalizeTopic(fallbackProblem.topic) });
      }

      return res.status(404).json({ error: 'Problem not found' });
    }

    res.json({ id: doc.id, ...doc.data(), topic: normalizeTopic(doc.data().topic) });
  } catch (error) {
    console.error('Get problem error:', error);
    const { id } = req.params;
    const fallbackProblem = fallbackProblems.find((problem) => problem.id === id);
    if (fallbackProblem) {
      return res.json({ ...fallbackProblem, topic: normalizeTopic(fallbackProblem.topic) });
    }

    res.status(500).json({ error: 'Failed to fetch problem' });
  }
};

// Create a new problem (admin only)
const createProblem = async (req, res) => {
  try {
    const missing = requiredFields.filter((field) => !req.body?.[field]);
    if (missing.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    }

    const rawTestCases = Array.isArray(req.body.testCases) ? req.body.testCases : [];
    const testCases = rawTestCases.map((tc) => ({
      input: String(tc?.input ?? '').trim(),
      expectedOutput: String(tc?.expectedOutput ?? '').trim(),
    }));

    const invalidTestCase = testCases.find((tc) => !tc.input || !tc.expectedOutput);
    if (invalidTestCase) {
      return res.status(400).json({ error: 'Each test case must include input and expectedOutput' });
    }

    const payload = {
      title: req.body.title,
      difficulty: req.body.difficulty,
      topic: req.body.topic,
      source: req.body.source || 'custom',
      sourceUrl: req.body.sourceUrl || req.body.leetcodeUrl || '',
      description: req.body.description,
      examples: Array.isArray(req.body.examples) ? req.body.examples : [],
      constraints: Array.isArray(req.body.constraints) ? req.body.constraints : [],
      hints: Array.isArray(req.body.hints) ? req.body.hints : [],
      testCases,
      starterCode:
        req.body.starterCode && typeof req.body.starterCode === 'object'
          ? req.body.starterCode
          : {
              javascript: '// Write your solution here',
              python: '# Write your solution here',
              java: '// Write your solution here',
              cpp: '// Write your solution here',
            },
      createdAt: new Date().toISOString(),
      createdBy: 'admin',
    };

    const docRef = await db.collection('problems').add(payload);
    return res.status(201).json({ id: docRef.id, ...payload });
  } catch (error) {
    console.error('Create problem error:', error);
    return res.status(500).json({ error: 'Failed to create problem' });
  }
};

const updateProblemProgress = async (req, res) => {
  try {
    const { id: problemId } = req.params;
    const { status } = req.body || {};
    const userId = req.user.uid;

    const allowed = ['attempted', 'solved', 'reset'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'status must be one of: attempted, solved, reset' });
    }

    const problemDoc = await db.collection('problems').doc(problemId).get();
    if (!problemDoc.exists) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const updates = {};

    if (status === 'attempted') {
      updates.attemptedProblems = admin.firestore.FieldValue.arrayUnion(problemId);
    }

    if (status === 'solved') {
      updates.attemptedProblems = admin.firestore.FieldValue.arrayUnion(problemId);
      updates.solvedProblems = admin.firestore.FieldValue.arrayUnion(problemId);

      const userData = userDoc.data();
      const today = new Date().toISOString().split('T')[0];
      const lastDate = userData.lastSolvedDate;
      let newStreak = userData.streak || 0;

      if (lastDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        newStreak = lastDate === yesterday ? newStreak + 1 : 1;
      }

      updates.streak = newStreak;
      updates.lastSolvedDate = today;

      // Track max streak ever achieved
      const currentMax = userData.maxStreak || 0;
      if (newStreak > currentMax) {
        updates.maxStreak = newStreak;
      }

      // Increment solve count for today in history map
      updates[`solveHistory.${today}`] = admin.firestore.FieldValue.increment(1);

      // Track recently solved: newest first, max 10 entries
      const currentRecent = userData.recentlySolved || [];
      updates.recentlySolved = [problemId, ...currentRecent.filter((id) => id !== problemId)].slice(0, 10);
    }

    if (status === 'reset') {
      updates.attemptedProblems = admin.firestore.FieldValue.arrayRemove(problemId);
      updates.solvedProblems = admin.firestore.FieldValue.arrayRemove(problemId);
    }

    await userRef.update(updates);
    const updated = await userRef.get();
    return res.json({ message: 'Progress updated', profile: updated.data() });
  } catch (error) {
    console.error('Update progress error:', error);
    return res.status(500).json({ error: 'Failed to update progress' });
  }
};

module.exports = { getAllProblems, getProblemById, createProblem, updateProblemProgress };
