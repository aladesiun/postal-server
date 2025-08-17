const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { models: { Post, User }, sequelize } = require('../models');
const multer = require('multer');
const { cloudinary } = require('../config/cloudinary');
const path = require('path');
const fs = require('fs').promises;

const router = Router();

// Configure multer for file uploads
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
      cb(null, 'posta-' + uniqueSuffix + path.extname(file.originalname));
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

router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const { text } = req.body;
    let mediaUrl = null;

    // Handle image upload if file is present
    if (req.file) {
      try {
        console.log('Uploading image to Cloudinary:', req.file.path);
        
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'postal_uploads',
          transformation: [
            { quality: 'auto', fetch_format: 'auto' },
            { width: 1080, height: 1080, crop: 'limit' }
          ],
          public_id: `posta_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });

        mediaUrl = result.secure_url;
        console.log('Image uploaded successfully:', mediaUrl);

        // Clean up temporary file
        await fs.unlink(req.file.path);
        
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        
        // Clean up temporary file on error
        if (req.file) {
          try {
            await fs.unlink(req.file.path);
          } catch (cleanupError) {
            console.error('Failed to cleanup temp file:', cleanupError);
          }
        }
        
        return res.status(500).json({ 
          error: 'Failed to upload image',
          details: uploadError.message 
        });
      }
    }

    // Create post with or without media
    const post = await Post.create({ 
      text: text || null, 
      mediaUrl: mediaUrl, 
      userId: req.user.id 
    });

    // Return the created post with user info
    const postWithUser = await Post.findByPk(post.id, {
      include: [
        { 
          model: User, 
          attributes: ['id', 'username', 'avatarUrl'] 
        }
      ],
      attributes: ['id', 'text', 'mediaUrl', 'created_at', 'userId']
    });

    res.status(201).json(postWithUser);
  } catch (error) {
    console.error('Error creating post:', error);
    
    // Clean up temporary file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Failed to cleanup temp file:', cleanupError);
      }
    }
    
    res.status(400).json({ error: error.message });
  }
});

router.get('/', requireAuth, async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const offset = Number(req.query.offset) || 0;
  
  try {
    const posts = await Post.findAll({
      order: [['id', 'DESC']],
      limit,
      offset,
      include: [
        { 
          model: User, 
          attributes: ['id', 'username', 'avatarUrl'] 
        }
      ],
      attributes: {
        include: [
          'id',
          'text',
          'mediaUrl',
          'created_at',
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM likes
              WHERE likes.post_id = Post.id
            )`),
            'likeCount'
          ],
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM comments
              WHERE comments.post_id = Post.id
            )`),
            'commentCount'
          ],
          [
            sequelize.literal(`(
              SELECT COUNT(*) > 0
              FROM likes
              WHERE likes.post_id = Post.id AND likes.user_id = ${req.user ? req.user.id : 0}
            )`),
            'hasLiked'
          ]
        ]
      }
    });
    
    // Convert to plain objects
    const postsWithLikes = posts.map(post => {
      const postData = post.get({ plain: true });
      return postData;
    });
    
    res.json(postsWithLikes);
  } catch (error) {
    console.error('Error fetching posts:', error);
    console.error('Error details:', {
      message: error.message,
      sql: error.sql,
      sqlMessage: error.sqlMessage
    });
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get posts by specific user
router.get('/user/:userId', requireAuth, async (req, res) => {
  const userId = Number(req.params.userId);
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const offset = Number(req.query.offset) || 0;
  
  try {
    const posts = await Post.findAll({
      where: { userId: userId },
      order: [['id', 'DESC']],
      limit,
      offset,
      include: [
        { 
          model: User, 
          attributes: ['id', 'username', 'avatarUrl'] 
        }
      ],
      attributes: {
        include: [
          'id',
          'text',
          'mediaUrl',
          'created_at',
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM likes
              WHERE likes.post_id = Post.id
            )`),
            'likeCount'
          ],
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM comments
              WHERE comments.post_id = Post.id
            )`),
            'commentCount'
          ],
          [
            sequelize.literal(`(
              SELECT COUNT(*) > 0
              FROM likes
              WHERE likes.post_id = Post.id AND likes.user_id = ${req.user ? req.user.id : 0}
            )`),
            'hasLiked'
          ]
        ]
      }
    });
    
    // Convert to plain objects
    const postsWithLikes = posts.map(post => {
      const postData = post.get({ plain: true });
      return postData;
    });
    
    res.json(postsWithLikes);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    console.error('Error details:', {
      message: error.message,
      sql: error.sql,
      sqlMessage: error.sqlMessage
    });
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  const post = await Post.findByPk(req.params.id);
  if (!post) return res.status(404).json({ error: 'Not found' });
  if (post.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  await post.destroy();
  res.status(204).send();
});

module.exports = router;

