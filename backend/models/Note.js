const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  content: { type: String, required: true, maxlength: 10000 },
  subject: { type: String, trim: true },
  tags: [{ type: String, trim: true }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  visibility: { type: String, enum: ['private', 'public'], default: 'private' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  saveCount: { type: Number, default: 0 },
  isAiEnhanced: { type: Boolean, default: false },
  aiSummary: { type: String },
}, { timestamps: true });

noteSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Note', noteSchema);
