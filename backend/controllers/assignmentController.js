const Assignment = require('../models/Assignment');
const User = require('../models/User');

// @desc    Get all user assignments
// @route   GET /api/assignments
// @access  Private
const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ user: req.user._id }).sort({ dueDate: 1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Private
const createAssignment = async (req, res) => {
  const { title, subject, description, dueDate, priority } = req.body;
  
  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const assignment = await Assignment.create({
      title,
      subject,
      description,
      dueDate,
      priority: priority || 'medium',
      user: req.user._id
    });
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create assignment', error: err.message });
  }
};

// @desc    Update assignment (and award XP on completion)
// @route   PUT /api/assignments/:id
// @access  Private
const updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this assignment' });
    }

    const wasCompleted = assignment.completed;
    Object.assign(assignment, req.body);
    await assignment.save();

    // Award XP when marking complete for the first time
    let xp = req.user.xp || 0;
    if (!wasCompleted && assignment.completed) {
      const updated = await User.findByIdAndUpdate(
        req.user._id,
        { $inc: { xp: 20 } },
        { new: true }
      );
      xp = updated.xp;
    }

    res.json({ ...assignment.toObject(), xp });
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private
const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this assignment' });
    }

    await assignment.deleteOne();
    res.json({ message: 'Assignment removed Successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};

module.exports = {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment
};
