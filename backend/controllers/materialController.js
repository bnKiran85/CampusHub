const Material = require('../models/Material');

// @desc    Get verified materials (Faculty/Admin uploads)
// @route   GET /api/materials/verified
// @access  Private
const getVerifiedMaterials = async (req, res) => {
  try {
    const materials = await Material.find({ 
      isVerified: true, 
      $or: [
        { visibility: 'public' },
        { uploadedBy: req.user._id }
      ]
    })
      .populate('uploadedBy', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch verified materials', error: err.message });
  }
};

// @desc    Get community materials (Student uploads)
// @route   GET /api/materials/community
// @access  Private
const getCommunityMaterials = async (req, res) => {
  try {
    const materials = await Material.find({ 
      isVerified: false, 
      $or: [
        { visibility: 'public' },
        { uploadedBy: req.user._id }
      ]
    })
      .populate('uploadedBy', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch community materials', error: err.message });
  }
};

// @desc    Get all materials (general search)
// @route   GET /api/materials
// @access  Private
const getAllMaterials = async (req, res) => {
  try {
    const { subject, category, semester } = req.query;
    let query = { status: 'approved' };
    if (subject) query.subject = subject;
    if (category) query.category = category;
    if (semester) query.semester = semester;

    const materials = await Material.find(query)
      .populate('uploadedBy', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch materials', error: err.message });
  }
};

// @desc    Add material
// @route   POST /api/materials
// @access  Private
const createMaterial = async (req, res) => {
  const { title, description, subject, link, fileUrl, category, semester, tags, visibility } = req.body;
  if (!title) return res.status(400).json({ message: 'Title is required' });

  try {
    const isFacultyOrAdmin = req.user.role === 'admin' || req.user.role === 'faculty';
    const material = await Material.create({
      title, 
      description, 
      subject, 
      semester, 
      tags,
      link: link || fileUrl,
      category: category || 'Other',
      uploadedBy: req.user._id,
      isVerified: isFacultyOrAdmin,
      visibility: visibility || 'public',
      status: isFacultyOrAdmin ? 'approved' : 'pending'
    });
    res.status(201).json(material);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add material', error: err.message });
  }
};

// @desc    Like/unlike material
// @route   PATCH /api/materials/:id/like
// @access  Private
const likeMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ message: 'Material not found' });
    
    const index = material.likes.findIndex(id => id.toString() === req.user._id.toString());
    if (index === -1) {
      material.likes.push(req.user._id);
    } else {
      material.likes.splice(index, 1);
    }
    await material.save();
    res.json({ likes: material.likes.length, isLiked: index === -1 });
  } catch (err) {
    res.status(500).json({ message: 'Action failed', error: err.message });
  }
};

// @desc    Verify/Approve material (Admin/Faculty only)
// @route   PATCH /api/materials/:id/verify
// @access  Private (Admin/Faculty)
const verifyMaterial = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Not authorized to verify materials' });
    }
    const material = await Material.findByIdAndUpdate(
      req.params.id, 
      { status: req.body.status || 'approved' }, 
      { new: true }
    );
    res.json(material);
  } catch (err) {
    res.status(500).json({ message: 'Verification failed', error: err.message });
  }
};

// @desc    Delete material
// @route   DELETE /api/materials/:id
// @access  Private
const deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ message: 'Material not found' });
    
    if (material.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this material' });
    }
    await material.deleteOne();
    res.json({ message: 'Material removed' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};

module.exports = {
  getVerifiedMaterials,
  getCommunityMaterials,
  getAllMaterials,
  createMaterial,
  likeMaterial,
  verifyMaterial,
  deleteMaterial
};
