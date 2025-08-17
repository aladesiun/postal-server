const jwt = require('jsonwebtoken');
const { JWT_PUBLIC_KEY } = require('../config/security');

function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const payload = jwt.verify(token, JWT_PUBLIC_KEY, { algorithms: ['RS256'] });
    req.user = { id: payload.sub, username: payload.username };
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

module.exports = { requireAuth };

