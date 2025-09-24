const Progress = require('../models/Progress');
const Lesson = require('../models/Lessons');
const Enroll = require('../models/Enroll');

// ---------------------
// Student Controllers
// ---------------------

// Get a student's overall progress in a course
exports.getCourseProgress = async (req, res) => {
  try {
    const studentId = req.userId;
    const { courseId } = req.params;

    // Get all lessons in the course
    const lessons = await Lesson.find({ courseId });
    if (!lessons.length) {
      return res.status(404).json({ message: "No lessons found for this course" });
    }

    // Get completed lessons for this student
    const completed = await Progress.find({
      studentId,
      courseId,
      isCompleted: true
    }).populate('lessonId', 'title');

    const completedCount = completed.length;
    const totalLessons = lessons.length;
    const percentage = (completedCount / totalLessons) * 100;

    res.status(200).json({
      courseId,
      studentId,
      totalLessons,
      completedLessons: completed.map(p => ({
        lessonId: p.lessonId._id,
        title: p.lessonId.title
      })),
      progress: percentage
    });
  } catch (err) {
    console.error("Error getting course progress:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark a lesson as completed
exports.markLessonComplete = async (req, res) => {
  try {
    const studentId = req.userId;
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    await Progress.findOneAndUpdate(
      { studentId, courseId: lesson.courseId, lessonId },
      { isCompleted: true, completedAt: new Date(), progress: 100 },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "Lesson marked as complete" });
  } catch (err) {
    console.error("Error marking lesson complete:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update lesson progress percentage
exports.updateLessonProgress = async (req, res) => {
  try {
    const studentId = req.userId;
    const { lessonId } = req.params;
    const { progress } = req.body;

    if (progress < 0 || progress > 100) {
      return res.status(400).json({ message: "Progress must be between 0 and 100" });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const updated = await Progress.findOneAndUpdate(
      { studentId, courseId: lesson.courseId, lessonId },
      { progress, isCompleted: progress === 100, completedAt: progress === 100 ? new Date() : null },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "Lesson progress updated", updated });
  } catch (err) {
    console.error("Error updating lesson progress:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Reset lesson progress
exports.resetLessonProgress = async (req, res) => {
  try {
    const studentId = req.userId;
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    await Progress.findOneAndUpdate(
      { studentId, courseId: lesson.courseId, lessonId },
      { progress: 0, isCompleted: false, completedAt: null },
      { new: true }
    );

    res.status(200).json({ message: "Lesson progress reset" });
  } catch (err) {
    console.error("Error resetting lesson progress:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------
// Instructor Controllers
// ---------------------

// Get all students' progress in a course
exports.getAllStudentsProgress = async (req, res) => {
  try {
    const { courseId } = req.params;

    const progress = await Progress.find({ courseId })
      .populate('studentId', 'fullName email')
      .populate('lessonId', 'title');

    res.status(200).json(progress);
  } catch (err) {
    console.error("Error getting all students progress:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a specific student's progress in a course
exports.getStudentCourseProgress = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    const progress = await Progress.find({ studentId, courseId })
      .populate('lessonId', 'title')
      .populate('courseId', 'title');

    if (!progress.length) {
      return res.status(404).json({ message: "No progress found for this student in the course" });
    }

    res.status(200).json(progress);
  } catch (err) {
    console.error("Error getting student course progress:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// ---------------------
// Instructor Analytics
// ---------------------
exports.getCourseAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;

    // 1. Total enrollments
    const enrollments = await Enroll.countDocuments({ courseId, status: "active" });

    // 2. Lessons in the course
    const lessons = await Lesson.find({ courseId });
    const totalLessons = lessons.length;

    // 3. Progress summary
    const progress = await Progress.find({ courseId });

    // Group progress by student
    const studentMap = {};
    progress.forEach(p => {
      const sid = p.studentId.toString();
      if (!studentMap[sid]) {
        studentMap[sid] = { completed: 0, total: totalLessons };
      }
      if (p.isCompleted) studentMap[sid].completed++;
    });

    // Calculate percentages
    const studentsSummary = Object.keys(studentMap).map(sid => {
      const s = studentMap[sid];
      return {
        studentId: sid,
        completedLessons: s.completed,
        totalLessons: s.total,
        progress: (s.completed / s.total) * 100
      };
    });

    // 4. Aggregate stats
    const avgProgress = studentsSummary.length
      ? studentsSummary.reduce((sum, s) => sum + s.progress, 0) / studentsSummary.length
      : 0;

    res.status(200).json({
      courseId,
      totalEnrollments: enrollments,
      totalLessons,
      avgProgress,
      studentsSummary
    });
  } catch (err) {
    console.error("Error getting course analytics:", err);
    res.status(500).json({ message: "Server error" });
  }
};

