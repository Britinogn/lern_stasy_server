const Course = require("../models/Course");

exports.getInstructorDashboard = async (req, res) => {
  try {
    // Fetch courses created by instructor with lessons and students populated
    const courses = await Course.find({ instructor: req.userId })
      .populate("lessons")
      .populate("students", "fullName email"); // Now this will work!

    // Calculate total statistics
    const dashboardStats = {
      totalCourses: courses.length,
      totalStudents: courses.reduce((sum, course) => sum + (course.students?.length || 0), 0),
      totalLessons: courses.reduce((sum, course) => sum + (course.lessons?.length || 0), 0)
    };

    // Build analytics
    const analytics = courses.map(course => ({
      courseId: course._id,
      title: course.title,
      totalLessons: course.lessons?.length || 0,
      totalEnrollments: course.students?.length || 0
    }));

    res.json({
      success: true,
      message: "Welcome to your Instructor Dashboard",
      user: { id: req.userId, role: req.userRole },
      dashboardStats,
      courses,
      analytics
    });
  } catch (err) {
    console.error('Instructor dashboard error:', err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to load dashboard data" 
    });
  }
};