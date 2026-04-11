const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment
} = require('../controllers/assignmentController');

// @route GET & POST /api/assignments
router.route('/')
  .get(protect, getAssignments)
  .post(protect, createAssignment);

// @route PUT & DELETE /api/assignments/:id
router.route('/:id')
  .put(protect, updateAssignment)
  .delete(protect, deleteAssignment);

module.exports = router;
