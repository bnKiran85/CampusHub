const express = require('express');
const router = express.Router();
const passport = require('passport');
const { registerUser, authUser, getUserProfile, updateUserProfile, getLeaderboard, generateToken } = require('../controllers/authController');
const { protect } = require('../middleware/auth');


// Public routes
router.post('/register', registerUser);
router.post('/login', authUser);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login` }),
  (req, res) => {
    // On success, generate token and redirect to frontend success handler
    const token = generateToken(req.user._id);
    res.redirect(`${process.env.FRONTEND_URL}/oauth/success?token=${token}`);
  }
);


// Private routes
router.get('/profile', protect, getUserProfile);
router.patch('/profile', protect, updateUserProfile);
router.get('/leaderboard', protect, getLeaderboard);

module.exports = router;
