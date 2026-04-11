const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  subject: { type: String, trim: true, default: 'General' },
  description: { type: String, maxlength: 2000 },
  dueDate: { type: Date },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
}, { timestamps: true });

// Auto-set completedAt when toggled
assignmentSchema.pre('save', function (next) {
  if (this.isModified('completed') && this.completed && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

assignmentSchema.index({ user: 1, dueDate: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
