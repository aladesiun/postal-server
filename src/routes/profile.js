const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { models: { User, Follow, Post } } = require('../models');
const multer = require('multer');
const { cloudinary } = require('../config/cloudinary');
const path = require('path');
const fs = require('fs').promises;

const router = Router();

// Configure multer for profile image uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadDir = 'uploads/';
      try {
        await fs.mkdir(uploadDir, { recursive: true });
        cb(null, uploadDir);
      } catch (error) {
        cb(error);
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Upload profile image
router.post('/upload-image', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('Uploading profile image to Cloudinary:', req.file.path);
    
    // Upload to Cloudinary using the same working approach as posts
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'postal_uploads',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
        { width: 512, height: 512, crop: 'limit' }
      ],
      public_id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    const avatarUrl = result.secure_url;
    console.log('Profile image uploaded successfully:', avatarUrl);

    // Clean up temporary file
    await fs.unlink(req.file.path);
    
    // Update user's profile with new avatar URL
    const user = await User.findByPk(req.user.id);
    await user.update({ avatarUrl: avatarUrl });
    
    res.json({ 
      success: true,
      avatarUrl: avatarUrl,
      message: 'Profile image updated successfully'
    });
    
  } catch (error) {
    console.error('Error uploading profile image:', error);
    
    // Clean up temporary file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Failed to cleanup temp file:', cleanupError);
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to upload profile image',
      details: error.message 
    });
  }
});

// Get current user's profile and posts (must come before /:username route)
router.get('/me/posts', requireAuth, async (req, res) => {
  try {
    console.log('Fetching current user profile for user ID:', req.user.id);
    
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'bio', 'avatarUrl']
    });
    
    if (!user) {
      console.log('User not found for ID:', req.user.id);
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('User found:', user.username);
    
    // Get user's posts count
    const postsCount = await Post.count({ where: { userId: user.id } });
    console.log('Posts count for user:', postsCount);
    
    // Get followers and following counts
    const followers = await Follow.count({ where: { followingId: user.id } });
    const following = await Follow.count({ where: { followerId: user.id } });
    console.log('Followers:', followers, 'Following:', following);
    
    const response = {
      ...user.toJSON(),
      postsCount,
      followers,
      following
    };
    
    console.log('Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error fetching current user profile:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch profile',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.get('/:username', async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ where: { username }, attributes: ['id', 'username', 'bio', 'avatarUrl'] });
  if (!user) return res.status(404).json({ error: 'Not found' });
  const followers = await Follow.count({ where: { followingId: user.id } });
  const following = await Follow.count({ where: { followerId: user.id } });
  res.json({ ...user.toJSON(), followers, following });
});

router.put('/', requireAuth, async (req, res) => {
  const { bio, avatarUrl } = req.body;
  const user = await User.findByPk(req.user.id);
  await user.update({ bio: bio ?? user.bio, avatarUrl: avatarUrl ?? user.avatarUrl });
  res.json({ id: user.id, username: user.username, bio: user.bio, avatarUrl: user.avatarUrl });
});

router.post('/:username/follow', requireAuth, async (req, res) => {
  const target = await User.findOne({ where: { username: req.params.username } });
  if (!target) return res.status(404).json({ error: 'Not found' });
  if (target.id === req.user.id) return res.status(400).json({ error: 'Cannot follow yourself' });
  const [record, created] = await Follow.findOrCreate({ where: { followerId: req.user.id, followingId: target.id }, defaults: { followerId: req.user.id, followingId: target.id } });
  if (!created) return res.json({ following: true });
  res.json({ following: true });
});

router.post('/:username/unfollow', requireAuth, async (req, res) => {
  const target = await User.findOne({ where: { username: req.params.username } });
  if (!target) return res.status(404).json({ error: 'Not found' });
  await Follow.destroy({ where: { followerId: req.user.id, followingId: target.id } });
  res.json({ following: false });
});

module.exports = router;

