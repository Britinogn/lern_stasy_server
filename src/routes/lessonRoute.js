const express = require('express');
const router = express.Router();
const auth = require ('../middleware/authMiddleware');
const lessonController = require('../controllers/lessonController');
const upload = require ('../middleware/uploadMiddleware');
//const authrequireInstructor = require('../middleware/instructorMiddleware');

const { requireRole } = require('../middleware/roleMiddleware');




// Public routes
router.get('/', auth, lessonController.getLessons);
router.get('/:id', auth, requireRole('student'), lessonController.getLesson); //enrollment

// Instructor-only routes
router.post('/', auth, requireRole('instructor'), upload.single('video'), lessonController.addLesson)
router.put('/:id',auth, requireRole('instructor'), upload.single('video'), lessonController.editLesson)
router.delete('/:id', auth, requireRole('instructor'), lessonController.deleteLesson)

// Student routes
// router.post('/:id/complete', auth, upload.single('video'), lessonController.createLesson)

module.exports = router;