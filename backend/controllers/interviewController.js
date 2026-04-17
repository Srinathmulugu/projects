const { db } = require('../utils/firebase');

// Start a mock interview - returns 3 random problems
const startInterview = async (req, res) => {
  try {
    const snapshot = await db.collection('problems').get();
    const problems = [];
    snapshot.forEach((doc) => {
      problems.push({ id: doc.id, ...doc.data() });
    });

    if (problems.length < 3) {
      return res.status(400).json({ error: 'Not enough problems in the database' });
    }

    // Pick 3 random problems: 1 easy, 1 medium, 1 hard if possible
    const easy = problems.filter((p) => p.difficulty === 'Easy');
    const medium = problems.filter((p) => p.difficulty === 'Medium');
    const hard = problems.filter((p) => p.difficulty === 'Hard');

    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const selected = [];
    if (easy.length) selected.push(pick(easy));
    if (medium.length) selected.push(pick(medium));
    if (hard.length) selected.push(pick(hard));

    // Fill remaining slots randomly
    while (selected.length < 3) {
      const random = pick(problems);
      if (!selected.find((s) => s.id === random.id)) {
        selected.push(random);
      }
    }

    res.json({
      problems: selected.slice(0, 3),
      duration: 45 * 60, // 45 minutes in seconds
      hintsDisabled: true,
    });
  } catch (error) {
    console.error('Interview error:', error);
    res.status(500).json({ error: 'Failed to start interview' });
  }
};

module.exports = { startInterview };
