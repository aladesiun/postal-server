const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { models: { Like } } = require('../models');

const router = Router();

router.post('/:postId/toggle', requireAuth, async (req, res) => {
  const postId = Number(req.params.postId);
  const userId = req.user.id;
  const existing = await Like.findOne({ where: { userId, postId } });
  if (existing) {
    await existing.destroy();
    return res.json({ liked: false });
  }
  await Like.create({ userId, postId });
  res.json({ liked: true });
});

module.exports = router;

