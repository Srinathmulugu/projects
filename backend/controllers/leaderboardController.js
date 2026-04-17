const { db } = require('../utils/firebase');

// Get leaderboard sorted by problems solved and streak
const getLeaderboard = async (req, res) => {
  try {
    const { sortBy } = req.query; // 'solved' or 'streak'

    const snapshot = await db.collection('users').get();
    const users = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: doc.id,
        name: data.name || 'Anonymous',
        solvedCount: (data.solvedProblems || []).length,
        streak: data.streak || 0,
      });
    });

    if (sortBy === 'streak') {
      users.sort((a, b) => b.streak - a.streak);
    } else {
      users.sort((a, b) => b.solvedCount - a.solvedCount);
    }

    res.json(users.slice(0, 50));
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

module.exports = { getLeaderboard };
