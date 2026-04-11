const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getNoteFeed,
  getUserNotes,
  createNote,
  likeNote,
  addComment,
  getComments,
  updateNote,
  deleteNote
} = require('../controllers/noteController');

// @route GET feed
router.get('/feed', protect, getNoteFeed);

// @route GET & POST /api/notes
router.route('/')
  .get(protect, getUserNotes)
  .post(protect, createNote);

// @route LIKE note
router.patch('/:id/like', protect, likeNote);

// @route Comments
router.route('/:id/comments')
  .get(protect, getComments)
  .post(protect, addComment);

// @route PUT & DELETE /api/notes/:id
router.route('/:id')
  .put(protect, updateNote)
  .delete(protect, deleteNote);

module.exports = router;
