const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: {
    type: String, required: true, unique: true, lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email address']
  },
  password: { type: String, required: true, minlength: 6 },
  course: { type: String, default: 'General', trim: true },
  role: { type: String, enum: ['student', 'admin', 'faculty'], default: 'student' },
  bookmarks: [{
    contentType: { type: String, enum: ['Note', 'Material'] },
    contentId: { type: mongoose.Schema.Types.ObjectId, refPath: 'bookmarks.contentType' }
  }],
  contributionStats: {
    totalLikes: { type: Number, default: 0 },
    totalUploads: { type: Number, default: 0 }
  },
  xp: { type: Number, default: 0, min: 0 },
  streak: { type: Number, default: 0, min: 0 },
  lastLoginDate: { type: Date },
  avatar: { type: String },
  isStatsPublic: { type: Boolean, default: true },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Public profile (no password)
userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

userSchema.index({ xp: -1 }); // For leaderboard queries

module.exports = mongoose.model('User', userSchema);
