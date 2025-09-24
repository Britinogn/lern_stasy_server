const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const progressController = require('../controllers/progressController');
//const requireStudent = require('../middleware/studentMiddleware');
//const requireInstructor = require('../middleware/instructorMiddleware');

const { requireRole }  = require('../middleware/roleMiddleware');


// Student routes
router.get('/', auth, requireRole('student'), progressController.getCourseProgress);
router.post('/lesson/:lessonId/complete', auth, requireRole('student'), progressController.markLessonComplete);
router.put('/lesson/:lessonId/progress', auth, requireRole('student'), progressController.updateLessonProgress);
router.delete('/lesson/:lessonId', auth, requireRole('student'), progressController.resetLessonProgress);

// Instructor routes
router.get('/course/:courseId/students', auth, requireRole('instructor'), progressController.getAllStudentsProgress);
router.get('/student/:studentId/course/:courseId', auth, requireRole('instructor'), progressController.getStudentCourseProgress);

// Instructor analytics
router.get('/course/:courseId/analytics', auth,  requireRole('instructor'), progressController.getCourseAnalytics);

module.exports = router;

