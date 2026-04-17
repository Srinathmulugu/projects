const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { register, getProfile, updateProfile } = require('../controllers/authController');

// Register / create user profile in Firestore
router.post('/register', authenticate, register);

// Get user profile
router.get('/profile', authenticate, getProfile);

// Update user profile
router.put('/profile', authenticate, updateProfile);

module.exports = router;
