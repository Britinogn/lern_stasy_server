const express = require('express');
const router = express.Router();
const auth = require ('../middleware/authMiddleware');
const lessonController = require('../controllers/lessonController');
const upload = require ('../middleware/uploadMiddleware');
const authrequireInstructor = require('../middleware/instructorMiddleware');
const enrollment = require('../middleware/enrollmentMiddleware');


// Public routes
router.get('/', auth, lessonController.getLessons);
router.get('/:id', auth, lessonController.getLesson); //enrollment

// Instructor-only routes
router.post('/', auth, authrequireInstructor, upload.single('video'), lessonController.addLesson)
router.put('/:id',auth, authrequireInstructor, upload.single('video'), lessonController.editLesson)
router.delete('/:id', auth, authrequireInstructor, lessonController.deleteLesson)

// Student routes
// router.post('/:id/complete', auth, upload.single('video'), lessonController.createLesson)

module.exports = router;