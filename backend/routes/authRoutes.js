const express = require('express');
const router = express.Router();
const {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
  getLeaderboard,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', registerUser);
router.post('/login', authUser);

// Private routes
router.get('/profile', protect, getUserProfile);
router.patch('/profile', protect, updateUserProfile);
router.get('/leaderboard', protect, getLeaderboard);

module.exports = router;
