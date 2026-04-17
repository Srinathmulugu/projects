const { db, admin } = require('../utils/firebase');

// Toggle bookmark for a problem
const toggleBookmark = async (req, res) => {
  try {
    const { problemId } = req.body;
    const userId = req.user.uid;

    if (!problemId) {
      return res.status(400).json({ error: 'problemId is required' });
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const bookmarks = userDoc.data().bookmarks || [];
    const isBookmarked = bookmarks.includes(problemId);

    if (isBookmarked) {
      await userRef.update({
        bookmarks: admin.firestore.FieldValue.arrayRemove(problemId),
      });
    } else {
      await userRef.update({
        bookmarks: admin.firestore.FieldValue.arrayUnion(problemId),
      });
    }

    res.json({ bookmarked: !isBookmarked });
  } catch (error) {
    console.error('Bookmark error:', error);
    res.status(500).json({ error: 'Failed to toggle bookmark' });
  }
};

// Get user's bookmarked problems
const getBookmarks = async (req, res) => {
  try {
    const userId = req.user.uid;
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const bookmarks = userDoc.data().bookmarks || [];
    res.json({ bookmarks });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
};

module.exports = { toggleBookmark, getBookmarks };
