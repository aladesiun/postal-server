const crypto = require('crypto');

function decodeKeyFromEnv(varName) {
  const value = process.env[varName];
  if (!value) return null;
  try {
    // Support base64-encoded keys
    const maybeDecoded = Buffer.from(value, 'base64').toString('utf8');
    if (maybeDecoded.includes('BEGIN')) return maybeDecoded;
    // If not base64, assume raw PEM
    return value;
  } catch (_) {
    return value;
  }
}

const JWT_PRIVATE_KEY = decodeKeyFromEnv('JWT_PRIVATE_KEY');
const JWT_PUBLIC_KEY = decodeKeyFromEnv('JWT_PUBLIC_KEY');

function generateSecureToken(size = 48) {
  return crypto.randomBytes(size).toString('hex');
}

module.exports = {
  JWT_PRIVATE_KEY,
  JWT_PUBLIC_KEY,
  generateSecureToken,
};

