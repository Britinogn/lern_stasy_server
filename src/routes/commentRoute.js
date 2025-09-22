const express = require('express');
const router = express.Router({mergeParams: true});
const auth = require ('../middleware/authMiddleware');
const commentController = require('../controllers/commentController');

// Public routes
router.post('/', auth, commentController.addComment);
router.get('/', commentController.getComment);
router.delete('/:id', auth, commentController.deleteComment);

module.exports = router;