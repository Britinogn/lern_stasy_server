const express = require('express');
const router = express.Router();
const auth = require ('../middleware/authMiddleware');
const enrollController = require('../controllers/enrollController');

// Public routes
router.get('/', enrollController.getEnrolls);
router.get('/:id', enrollController.getEnroll)

// Instructor-only routes
router.post('/', enrollController.createEnroll)
router.put('/:id',auth, enrollController.updateEnroll)
router.delete('/:id', auth, enrollController.deleteEnroll)

module.exports = router;