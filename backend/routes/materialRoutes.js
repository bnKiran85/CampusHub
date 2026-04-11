const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getVerifiedMaterials,
  getCommunityMaterials,
  getAllMaterials,
  createMaterial,
  likeMaterial,
  verifyMaterial,
  deleteMaterial
} = require('../controllers/materialController');

// @route GET verified & community
router.get('/verified', protect, getVerifiedMaterials);
router.get('/community', protect, getCommunityMaterials);

// @route GET all & POST new
router.route('/')
  .get(protect, getAllMaterials)
  .post(protect, createMaterial);

// @route LIKE material
router.patch('/:id/like', protect, likeMaterial);

// @route VERIFY material (Admin/Faculty)
router.patch('/:id/verify', protect, verifyMaterial);

// @route DELETE material
router.delete('/:id', protect, deleteMaterial);

module.exports = router;
