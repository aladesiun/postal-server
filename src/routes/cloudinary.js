const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { cloudinary } = require('../config/cloudinary');

const router = Router();

// Signed upload preset for client direct uploads
router.get('/signature', requireAuth, async (req, res) => {
  try {
    // Validate Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ 
        error: 'Cloudinary configuration missing. Please check your environment variables.' 
      });
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'postal_uploads';
    
    // Only sign the essential parameters that Cloudinary requires
    const paramsToSign = { 
      timestamp, 
      folder
    };
    
    const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);
    
    console.log('Cloudinary signature generated:', {
      timestamp,
      signature,
      paramsToSign,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecretLength: process.env.CLOUDINARY_API_SECRET ? process.env.CLOUDINARY_API_SECRET.length : 0
    });
    
    res.json({ 
      timestamp, 
      signature, 
      cloudName: process.env.CLOUDINARY_CLOUD_NAME, 
      apiKey: process.env.CLOUDINARY_API_KEY, 
      folder
    });
  } catch (error) {
    console.error('Cloudinary signature error:', error);
    res.status(500).json({ 
      error: 'Failed to generate upload signature',
      details: error.message 
    });
  }
});

// Test endpoint to verify signature generation
router.get('/test-signature', requireAuth, async (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'postal_uploads';
    
    const paramsToSign = { timestamp, folder };
    const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);
    
    // Test the signature by creating a test upload URL
    const testUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload?timestamp=${timestamp}&signature=${signature}&api_key=${process.env.CLOUDINARY_API_KEY}&folder=${folder}`;
    
    res.json({
      success: true,
      timestamp,
      signature,
      paramsToSign,
      testUrl,
      message: 'Signature generated successfully'
    });
  } catch (error) {
    console.error('Test signature error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

