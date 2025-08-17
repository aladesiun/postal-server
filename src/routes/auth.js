const { Router } = require('express');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const { models: { User } } = require('../models');
const { JWT_PRIVATE_KEY } = require('../config/security');

const router = Router();

function issueTokens(user) {
  const payload = { sub: user.id, username: user.username };
  const accessToken = jwt.sign(payload, JWT_PRIVATE_KEY, { algorithm: 'RS256', expiresIn: '15m' });
  const refreshToken = jwt.sign({ sub: user.id, type: 'refresh' }, JWT_PRIVATE_KEY, { algorithm: 'RS256', expiresIn: '7d' });
  return { accessToken, refreshToken };
}

router.post('/register', async (req, res) => {

  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    console.log(username, email, password);

    const passwordHash = await argon2.hash(password);
    const user = await User.create({ username, email, passwordHash });
    const tokens = issueTokens(user);
    res.status(201).json({ user: { id: user.id, username, email }, ...tokens });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await argon2.verify(user.passwordHash, password || '');
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const tokens = issueTokens(user);
    res.json({ user: { id: user.id, username: user.username, email }, ...tokens });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Missing token' });
    const decoded = jwt.verify(refreshToken, require('../config/security').JWT_PUBLIC_KEY, { algorithms: ['RS256'] });
    if (decoded.type !== 'refresh') return res.status(400).json({ error: 'Invalid token' });
    const user = await User.findByPk(decoded.sub);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const tokens = issueTokens(user);
    res.json(tokens);
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// For simplicity, logout is handled client-side (token discard). In production, manage refresh token store/blacklist.
router.post('/logout', async (req, res) => {
  res.json({ ok: true });
});

module.exports = router;

