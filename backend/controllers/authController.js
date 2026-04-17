const { db } = require('../utils/firebase');

// Register user profile in Firestore after Firebase Auth signup
const register = async (req, res) => {
  try {
    const { uid, email, name } = req.user;
    const userRef = db.collection('users').doc(uid);
    const existing = await userRef.get();

    if (existing.exists) {
      return res.json({ message: 'User already exists', user: existing.data() });
    }

    const userData = {
      id: uid,
      email,
      name: name || req.body.name || email.split('@')[0],
      solvedProblems: [],
      attemptedProblems: [],
      bookmarks: [],
      streak: 0,
        maxStreak: 0,
        lastSolvedDate: null,
        solveHistory: {},
        recentlySolved: [],
        createdAt: new Date().toISOString(),
    };

    await userRef.set(userData);
    res.status(201).json({ message: 'User registered', user: userData });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const userRef = db.collection('users').doc(req.user.uid);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(doc.data());
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const userRef = db.collection('users').doc(req.user.uid);

    await userRef.update({ name });
    const updated = await userRef.get();
    res.json(updated.data());
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

module.exports = { register, getProfile, updateProfile };
