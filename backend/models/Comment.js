const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true, maxlength: 1000 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  onModel: { type: String, required: true, enum: ['Note', 'Material'] },
  onId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'onModel' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

commentSchema.index({ onId: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
