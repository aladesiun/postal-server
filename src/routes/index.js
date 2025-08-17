const { Router } = require('express');

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Postal API' });
});

router.use('/auth', require('./auth'));
router.use('/users', require('./users'));
router.use('/profile', require('./profile'));
router.use('/posts', require('./posts'));
router.use('/comments', require('./comments'));
router.use('/likes', require('./likes'));
router.use('/cloudinary', require('./cloudinary'));

module.exports = router;
