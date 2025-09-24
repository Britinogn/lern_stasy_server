const express = require('express');
const router = express.Router({mergeParams: true});
const auth = require ('../middleware/authMiddleware');
const commentController = require('../controllers/commentController');
//const { requireRole } = require('../middleware/roleMiddleware');




// Public routes
router.get('/', auth, commentController.getComments);
router.post('/', auth,  commentController.addComment);
router.post('/:parentId/reply', auth, commentController.addReply);
router.delete('/:id', auth,  commentController.deleteComment);


module.exports = router;


///api/lessons/:lessonId/comments/:parentId/reply