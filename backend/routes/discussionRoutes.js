const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getDiscussions,
  createDiscussion,
  upvotePost,
  replyToPost
} = require('../controllers/discussionController');

// @route GET & POST discussions
router.route('/')
  .get(protect, getDiscussions)
  .post(protect, createDiscussion);

// @route UPVOTE a post
router.put('/:id/upvote', protect, upvotePost);

// @route REPLY to a post
router.post('/:id/reply', protect, replyToPost);

module.exports = router;
