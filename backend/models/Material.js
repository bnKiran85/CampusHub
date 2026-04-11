const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, maxlength: 1000 },
  subject: { type: String, trim: true },
  link: { type: String, trim: true },         // External URL or Cloudinary URL
  fileUrl: { type: String },                   // Keep backward compat
  category: { type: String, enum: ['PDF', 'Notes', 'Video', 'Slides', 'Link', 'Other'], default: 'Other' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  semester: { type: Number, min: 1, max: 8 },
  tags: [{ type: String, trim: true }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  visibility: { type: String, enum: ['public', 'private'], default: 'public', index: true },
}, { timestamps: true });

materialSchema.index({ subject: 1 });

module.exports = mongoose.model('Material', materialSchema);
