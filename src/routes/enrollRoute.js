const express = require('express');
const router = express.Router();
const auth = require ('../middleware/authMiddleware');
const enrollController = require('../controllers/enrollController');
//const authrequireInstructor = require('../middleware/instructorMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Public routes
router.get('/', enrollController.getEnrolls);
router.get('/:id', enrollController.getEnroll)


// Instructor-only routes
router.post('/', auth,  enrollController.createEnroll)
router.put('/:id',auth, requireRole('instructor'), enrollController.updateEnroll)
router.delete('/:id', auth, requireRole('instructor'), enrollController.deleteEnroll)

module.exports = router;