const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetModel: { type: String, required: true, enum: ['Note', 'Material', 'Comment'] },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'targetModel' },
  reason: { type: String, required: true, maxlength: 500 },
  status: { type: String, enum: ['pending', 'resolved', 'ignored'], default: 'pending' },
  actionTaken: { type: String },
}, { timestamps: true });

reportSchema.index({ status: 1 });

module.exports = mongoose.model('Report', reportSchema);
