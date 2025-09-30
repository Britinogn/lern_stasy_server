const express = require("express");
const auth = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const {
  getStudentDashboard,
  getMyCourses,
  getCourseDetails,
  updateLessonProgress,
  getStudentProfile,
  updateStudentProfile
} = require("../controllers/studentController");

const router = express.Router();

router.get("/dashboard", auth, requireRole("student"), getStudentDashboard);
router.get("/courses", auth, requireRole("student"), getMyCourses);
router.get("/courses/:courseId", auth, requireRole("student"), getCourseDetails);
router.put("/courses/:courseId/lessons/:lessonId/progress", auth, requireRole("student"), updateLessonProgress);
router.get("/profile", auth, requireRole("student"), getStudentProfile);
router.put("/profile", auth, requireRole("student"), updateStudentProfile);

module.exports = router;