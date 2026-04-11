const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const Material = require('../models/Material');
const Report = require('../models/Report');
const { protect, admin } = require('../middleware/auth');

// Middleware to check for Admin or Faculty
const adminOrFaculty = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'faculty')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as Admin or Faculty' });
  }
};

// GET all pending content
router.get('/pending', protect, adminOrFaculty, async (req, res) => {
  try {
    const pendingNotes = await Note.find({ status: 'pending' }).populate('user', 'name email');
    const pendingMaterials = await Material.find({ status: 'pending' }).populate('uploadedBy', 'name email');
    res.json({ notes: pendingNotes, materials: pendingMaterials });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH approve/reject note
router.patch('/notes/:id/status', protect, adminOrFaculty, async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    const note = await Note.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(note);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET all reports
router.get('/reports', protect, adminOrFaculty, async (req, res) => {
  try {
    const reports = await Report.find({ status: 'pending' })
      .populate('reporter', 'name')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH resolve report
router.patch('/reports/:id/resolve', protect, adminOrFaculty, async (req, res) => {
  try {
    const { status, actionTaken } = req.body;
    const report = await Report.findByIdAndUpdate(req.params.id, { status, actionTaken }, { new: true });
    res.json(report);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
