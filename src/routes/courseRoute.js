const express = require('express');
const router = express.Router();
const auth = require ('../middleware/authMiddleware');
const courseController = require('../controllers/courseController');
const upload = require ('../middleware/uploadMiddleware');
//const authrequireInstructor = require('../middleware/instructorMiddleware')
const { requireRole } = require('../middleware/roleMiddleware');


// Debug logs
// console.log('auth type:', typeof auth);
// console.log('upload type:', typeof upload);
// console.log('upload.single type:', typeof upload.single);
// console.log('courseController.createCourse type:', typeof courseController.createCourse);


// Public routes
router.get('/', courseController.getCourses);
router.get('/:id', courseController.getCourse)

// Instructor-only routes (need requireInstructor middleware)
router.post('/', auth, requireRole('instructor') ,upload.single('image') , courseController.createCourse)
router.put('/:id',auth, requireRole('instructor'),  upload.single('image'), courseController.updateCourse)
router.delete('/:id', auth, requireRole('instructor'), courseController.deleteCourse)

// Student routes (authenticated)
//router.get('/:id/enroll', auth, courseController.enrollCourse)
//router.get('/:id/lessons', auth, courseController.getCourseLessons) // Enrolled students only
//router.get('/:id/progress', auth, courseController.getCourseProgress)


module.exports = router;

// router.get('/', courseController.getCourse)
// router.get('/', courseController.getCourse)
// router.get('/', courseController.getCourse)