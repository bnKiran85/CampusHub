const Note = require('../models/Note');
const Comment = require('../models/Comment');

// @desc    Get public feed (approved notes)
// @route   GET /api/notes/feed
// @access  Private
const getNoteFeed = async (req, res) => {
  try {
    const { subject, tag, sort } = req.query;
    // Show public items OR any items owned by the user
    let query = { 
      $or: [
        { visibility: 'public' },
        { user: req.user._id }
      ]
    };
    
    if (subject) query.subject = subject;
    if (tag) query.tags = tag;

    let sortOption = { createdAt: -1 };
    if (sort === 'trending') sortOption = { views: -1, likes: -1 };

    const notes = await Note.find(query)
      .populate('user', 'name avatar')
      .sort(sortOption)
      .limit(20);
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch feed', error: err.message });
  }
};

// @desc    Get all notes for user (private or personal public)
// @route   GET /api/notes
// @access  Private
const getUserNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user notes', error: err.message });
  }
};

// @desc    Create note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res) => {
  const { title, content, subject, tags, visibility } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  try {
    const note = await Note.create({ 
      title, 
      content, 
      subject, 
      tags, 
      visibility: visibility || 'private',
      status: visibility === 'public' ? 'pending' : 'approved',
      user: req.user._id 
    });
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create note', error: err.message });
  }
};

// @desc    Like/unlike note
// @route   PATCH /api/notes/:id/like
// @access  Private
const likeNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    
    const index = note.likes.findIndex(id => id.toString() === req.user._id.toString());
    if (index === -1) {
      note.likes.push(req.user._id);
    } else {
      note.likes.splice(index, 1);
    }
    await note.save();
    res.json({ likes: note.likes.length, isLiked: index === -1 });
  } catch (err) {
    res.status(500).json({ message: 'Action failed', error: err.message });
  }
};

// @desc    Comment on note
// @route   POST /api/notes/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.create({
      content,
      user: req.user._id,
      onModel: 'Note',
      onId: req.params.id
    });
    const populated = await comment.populate('user', 'name avatar');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add comment', error: err.message });
  }
};

// @desc    Get comments for note
// @route   GET /api/notes/:id/comments
// @access  Private
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ onId: req.params.id, onModel: 'Note' })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch comments', error: err.message });
  }
};

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this note' });
    }
    
    // If visibility changes to public, reset status to pending
    if (req.body.visibility === 'public' && note.visibility !== 'public') {
      req.body.status = 'pending';
    }
    
    Object.assign(note, req.body);
    await note.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this note' });
    }
    await note.deleteOne();
    res.json({ message: 'Note removed' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};

module.exports = {
  getNoteFeed,
  getUserNotes,
  createNote,
  likeNote,
  addComment,
  getComments,
  updateNote,
  deleteNote
};
