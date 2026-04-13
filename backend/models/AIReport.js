const mongoose = require('mongoose');

const aiReportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subject: { type: String, required: true },
  summary: { type: String, required: true },
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  recommendations: [{ type: String }],
  studyPlan: [{
    day: { type: String },
    tasks: [{ type: String }]
  }],
  performanceScore: { type: Number, min: 0, max: 100 },
  dataSnapshot: {
    xp: { type: Number },
    streak: { type: Number },
    noteCount: { type: Number },
    assignmentCount: { type: Number },
    quizData: { type: mongoose.Schema.Types.Mixed } // Flexible for future quiz results
  }
}, { timestamps: true });

module.exports = mongoose.model('AIReport', aiReportSchema);
