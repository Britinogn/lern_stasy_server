const express = require("express");
const auth = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const User = require("../models/Users");
const Course = require("../models/Course");
const Enroll = require("../models/Enroll");
const router = express.Router();

const getStudentDashboard = async (req, res) => {
  try {
    // Get student with populated courses
    const student = await User.findById(req.userId)
      .populate({
        path: "enrolledCourses",
        populate: {
          path: "instructor",
          select: "fullName"
        }
      });

    // Get enrollment details with progress
    const enrollments = await Enroll.find({ studentId: req.userId })
      .populate('courseId', 'title description price thumbnail')
      .sort({ enrolledAt: -1 });

    // Calculate dashboard statistics
    const stats = {
      totalEnrolledCourses: enrollments.length,
      completedCourses: enrollments.filter(e => e.progress >= 100).length,
      inProgressCourses: enrollments.filter(e => e.progress < 100).length,
      totalCompletedLessons: enrollments.reduce((sum, e) => sum + (e.completedLessons?.length || 0), 0)
    };

    // Format courses with progress
    const coursesWithProgress = enrollments.map(enrollment => ({
      courseId: enrollment.courseId._id,
      title: enrollment.courseId.title,
      description: enrollment.courseId.description,
      price: enrollment.courseId.price,
      thumbnail: enrollment.courseId.thumbnail,
      enrolledAt: enrollment.enrolledAt,
      progress: enrollment.progress || 0,
      status: (enrollment.progress >= 100) ? 'completed' : 'in-progress'
    }));

    // Get recommended courses (not enrolled)
    const enrolledCourseIds = enrollments.map(e => e.courseId._id);
    const recommendedCourses = await Course.find({
      _id: { $nin: enrolledCourseIds }
    })
    .populate('instructor', 'fullName')
    .limit(4)
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "Welcome to your Student Dashboard",
      user: {
        id: req.userId,
        role: req.userRole,
        fullName: student.fullName,
        email: student.email
      },
      stats,
      courses: coursesWithProgress,
      recommendedCourses
    });
  } catch (err) {
    console.error('Student dashboard error:', err);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
    });
  }
};

router.get("/dashboard", auth, requireRole("student"), getStudentDashboard);

module.exports = router;