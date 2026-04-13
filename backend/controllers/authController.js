const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id, expiresIn = '30d') => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, course } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      course: course || 'General',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        course: user.course,
        role: user.role,
        xp: user.xp,
        streak: user.streak,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Streak tracking
      const today = new Date().toDateString();
      const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate).toDateString() : null;
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      let xpBonus = 0;
      if (lastLogin !== today) {
        if (lastLogin === yesterday) {
          user.streak += 1;
        } else {
          user.streak = 1;
        }
        user.xp += 5; // Daily login XP
        xpBonus = 5;
        user.lastLoginDate = new Date();
        await user.save();
      }

      // Token duration based on Remember Me
      const tokenExpiry = rememberMe ? '30d' : '1d';

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        course: user.course,
        role: user.role,
        xp: user.xp,
        streak: user.streak,
        token: generateToken(user._id, tokenExpiry),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      course: user.course,
      role: user.role,
      xp: user.xp,
      streak: user.streak,
      avatar: user.avatar,
      isStatsPublic: user.isStatsPublic,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user profile
// @route   PATCH /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.course = req.body.course || user.course;
      user.avatar = req.body.avatar || user.avatar;
      
      if (req.body.isStatsPublic !== undefined) {
        user.isStatsPublic = req.body.isStatsPublic;
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        course: updatedUser.course,
        role: updatedUser.role,
        xp: updatedUser.xp,
        streak: updatedUser.streak,
        avatar: updatedUser.avatar,
        isStatsPublic: updatedUser.isStatsPublic,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get leaderboard
// @route   GET /api/auth/leaderboard
// @access  Private
const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ isStatsPublic: true })
      .select('name course xp streak avatar')
      .sort({ xp: -1 })
      .limit(50);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
  getLeaderboard,
  generateToken,
};

