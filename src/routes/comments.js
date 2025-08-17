const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { models: { Comment, User } } = require('../models');

const router = Router();

router.post('/', requireAuth, async (req, res) => {
  try {
    const { postId, text } = req.body;
    if (!postId || !text) return res.status(400).json({ error: 'Missing fields' });
    const comment = await Comment.create({ postId, text, userId: req.user.id });
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:postId', async (req, res) => {
  const postId = Number(req.params.postId);
  const comments = await Comment.findAll({
    where: { postId },
    order: [['id', 'ASC']],
    include: [{ model: User, attributes: ['id', 'username', 'avatarUrl'] }],
  });
  res.json(comments);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const comment = await Comment.findByPk(req.params.id);
  if (!comment) return res.status(404).json({ error: 'Not found' });
  if (comment.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  await comment.destroy();
  res.status(204).send();
});

module.exports = router;

