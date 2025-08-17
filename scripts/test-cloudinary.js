#!/usr/bin/env node
/**
 * Test Cloudinary configuration
 * Run with: node scripts/test-cloudinary.js
 */

require('dotenv').config();
const { cloudinary } = require('../src/config/cloudinary');

async function testCloudinary() {
  console.log('🔍 Testing Cloudinary configuration...\n');

  // Check environment variables
  console.log('Environment Variables:');
  console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing');
  console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing');

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.log('\n❌ Missing required Cloudinary environment variables!');
    console.log('Please check your .env file and ensure all Cloudinary variables are set.');
    return;
  }

  try {
    // Test Cloudinary connection
    console.log('\n🔗 Testing Cloudinary connection...');
    
    // Test API credentials by getting account info
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful:', result);
    
    // Test signature generation
    console.log('\n🔐 Testing signature generation...');
    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsToSign = { 
      timestamp, 
      folder: 'postal_uploads',
      allowed_formats: 'jpg,jpeg,png,gif,webp',
      transformation: 'f_auto,q_auto'
    };
    
    const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);
    console.log('✅ Signature generated successfully:', signature);
    
    console.log('\n🎉 All Cloudinary tests passed! Your configuration is working correctly.');
    
  } catch (error) {
    console.log('\n❌ Cloudinary test failed:', error.message);
    console.log('Please check your API credentials and try again.');
  }
}

testCloudinary().catch(console.error); 