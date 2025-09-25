const express = require('express');
const router = express.Router();
const auth = require ('../middleware/authMiddleware');
const enrollController = require('../controllers/enrollController');
//const authrequireInstructor = require('../middleware/instructorMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Public routes
router.get('/', auth, requireRole('instructor'), enrollController.getEnrolls);
router.get('/:id', auth, enrollController.getEnroll)



// Student-only: create enrollment
router.post('/', auth, requireRole('student'),  enrollController.createEnroll)

// Instructor-only routes
router.put('/:id',auth, requireRole('instructor'), enrollController.updateEnroll)
router.delete('/:id', auth, requireRole('instructor'), enrollController.deleteEnroll)

module.exports = router;