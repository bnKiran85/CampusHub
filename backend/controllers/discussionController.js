const Post = require('../models/Post');

// @desc    Get all posts (public or authored by user)
// @route   GET /api/discussions
// @access  Private
const getDiscussions = async (req, res) => {
  try {
    const posts = await Post.find({
      $or: [{ visibility: 'public' }, { author: req.user._id }]
    })
      .populate('author', 'name avatar')
      .populate('replies.author', 'name avatar')
      .sort({ upvotes: -1, createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch discussions', error: err.message });
  }
};

// @desc    Create new discussion post
// @route   POST /api/discussions
// @access  Private
const createDiscussion = async (req, res) => {
  const { title, content, subject, visibility } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content required' });
  }

  try {
    const post = await Post.create({ 
      title, 
      content, 
      subject, 
      author: req.user._id,
      visibility: visibility || 'public' 
    });
    await post.populate('author', 'name avatar');
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create discussion', error: err.message });
  }
};

// @desc    Upvote a post
// @route   PUT /api/discussions/:id/upvote
// @access  Private
const upvotePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { upvotes: 1 } },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ upvotes: post.upvotes });
  } catch (err) {
    res.status(500).json({ message: 'Action failed', error: err.message });
  }
};

// @desc    Reply to a post
// @route   POST /api/discussions/:id/reply
// @access  Private
const replyToPost = async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: 'Reply content required' });

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    post.replies.push({ content, author: req.user._id });
    await post.save();
    
    await post.populate('author', 'name avatar');
    await post.populate('replies.author', 'name avatar');
    
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Failed to post reply', error: err.message });
  }
};

module.exports = {
  getDiscussions,
  createDiscussion,
  upvotePost,
  replyToPost
};
