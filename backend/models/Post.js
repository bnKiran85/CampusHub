const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  content: { type: String, required: true, maxlength: 1000 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 300 },
  content: { type: String, required: true, maxlength: 3000 },
  subject: { type: String, trim: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  upvotes: { type: Number, default: 0 },
  replies: [replySchema],
  visibility: { type: String, enum: ['public', 'private'], default: 'public', index: true },
}, { timestamps: true });

postSchema.index({ upvotes: -1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
