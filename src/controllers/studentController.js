const User = require("../models/Users");
const Course = require("../models/Course");
const Enroll = require("../models/Enroll");

exports.getStudentDashboard = async (req, res) => {
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

exports.getMyCourses = async (req, res) => {
  try {
    const enrollments = await Enroll.find({ studentId: req.userId })
      .populate('courseId', 'title description price thumbnail instructor')
      .populate('courseId.instructor', 'fullName')
      .sort({ enrolledAt: -1 });

    const courses = enrollments.map(enrollment => ({
      courseId: enrollment.courseId._id,
      title: enrollment.courseId.title,
      description: enrollment.courseId.description,
      price: enrollment.courseId.price,
      thumbnail: enrollment.courseId.thumbnail,
      instructor: enrollment.courseId.instructor,
      enrolledAt: enrollment.enrolledAt,
      progress: enrollment.progress || 0,
      completedLessons: enrollment.completedLessons || [],
      status: (enrollment.progress >= 100) ? 'completed' : 'in-progress'
    }));

    res.json({
      success: true,
      courses
    });
  } catch (err) {
    console.error('Get my courses error:', err);
    res.status(500).json({
      success: false,
      message: "Failed to load courses",
    });
  }
};

exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if student is enrolled
    const enrollment = await Enroll.findOne({
      studentId: req.userId,
      courseId: courseId
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course"
      });
    }

    // Get course with lessons
    const course = await Course.findById(courseId)
      .populate('instructor', 'fullName email')
      .populate('lessons');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    res.json({
      success: true,
      course,
      enrollment: {
        progress: enrollment.progress || 0,
        completedLessons: enrollment.completedLessons || [],
        enrolledAt: enrollment.enrolledAt
      }
    });
  } catch (err) {
    console.error('Get course details error:', err);
    res.status(500).json({
      success: false,
      message: "Failed to load course details",
    });
  }
};

exports.updateLessonProgress = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const { completed } = req.body;

    const enrollment = await Enroll.findOne({
      studentId: req.userId,
      courseId: courseId
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course"
      });
    }

    // Update completed lessons
    if (completed && !enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
    } else if (!completed) {
      enrollment.completedLessons = enrollment.completedLessons.filter(
        id => id.toString() !== lessonId
      );
    }

    // Calculate progress
    const course = await Course.findById(courseId);
    const totalLessons = course.lessons.length;
    const completedCount = enrollment.completedLessons.length;
    enrollment.progress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

    await enrollment.save();

    res.json({
      success: true,
      message: "Progress updated successfully",
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons
    });
  } catch (err) {
    console.error('Update lesson progress error:', err);
    res.status(500).json({
      success: false,
      message: "Failed to update progress",
    });
  }
};

exports.getStudentProfile = async (req, res) => {
  try {
    const student = await User.findById(req.userId).select('-password');
    
    res.json({
      success: true,
      user: student
    });
  } catch (err) {
    console.error('Get student profile error:', err);
    res.status(500).json({
      success: false,
      message: "Failed to load profile",
    });
  }
};

exports.updateStudentProfile = async (req, res) => {
  try {
    const { fullName, email, bio, phone } = req.body;

    const student = await User.findByIdAndUpdate(
      req.userId,
      { fullName, email, bio, phone },
      { new: true, select: '-password' }
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: student
    });
  } catch (err) {
    console.error('Update student profile error:', err);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};