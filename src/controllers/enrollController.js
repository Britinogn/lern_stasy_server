const Enroll = require ('../models/Enroll')
const Course = require('../models/Course')
const Lesson = require('../models/Lessons')



// GET all enrollments
exports.getEnrolls = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        const total = await Lesson.countDocuments();

        const enrolls = await Enroll.find()
            .populate('studentId', 'fullName email')
            .populate('courseId', 'title description')
            .populate('progress.lessonId', 'title')
            .sort({createdAt: -1})
            .skip(Number(skip))
            .limit(Number(limit))
        res.json({ total, page: Number(page), limit: Number(limit), enrolls });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET a single enrollment by ID

exports.getEnroll = async (req, res) => {
  try {
    const enroll = await Enroll.findById(req.params.id)
    .populate('studentId', 'fullName email')
    .populate('courseId', 'title description')
    .populate('progress.lessonId', 'title');

    if(!enroll){
      return res.status(404).json({message: 'Enrollment not found'})
    }

    res.status(200).json(enroll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE a new enrollment
exports.createEnroll = async (req, res) => {
  try {
    const { studentId } = req.body;
    const { courseId } = req.params;

    console.log("📘 Enrollment attempt:", { studentId, courseId });

    if (!studentId || !courseId) {
      return res.status(400).json({ message: 'studentId and courseId are required.' });
    }

    const existingEnrollment = await Enroll.findOne({ studentId, courseId });
    if (existingEnrollment) {
      return res.status(409).json({ message: 'You are already enrolled in this course.' });
    }

    const enrollment = await Enroll.create({ studentId, courseId });
    return res.status(201).json({
      message: 'Enrollment successful',
      enrollment,
    });
  } catch (error) {
    console.error('❌ Enrollment error:', error);
    return res.status(500).json({
      message: 'Enrollment failed. Please try again.',
      error: error.message,
    });
  }
};


// UPDATE enrollment (e.g., progress, status)
exports.updateEnroll = async (req, res) => {
    try {
        const { progress, status } = req.body;
        const enroll = await Enroll.findById(req.params.id);

        if (!enroll) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }

        // Update progress if provided
        if (progress && Array.isArray(progress)) {
            progress.forEach((p) => {

                // Validate progress item structure
                if (!p.lessonId) return;

                const existingLesson = enroll.progress.find(
                    (pl) => pl.lessonId.toString() === p.lessonId
                );
                if (existingLesson) {
                    // Update existing progress
                    //existingLesson.completedAt = p.completedAt || existingLesson.completedAt;
                    //existingLesson.timeSpent = p.timeSpent || existingLesson.timeSpent;

                    if (p.completedAt !== undefined) existingLesson.completedAt = p.completedAt;
                    if (p.timeSpent !== undefined) existingLesson.timeSpent = p.timeSpent;

                } else {
                    enroll.progress.push({
                        lessonId: p.lessonId,
                        completedAt: p.completedAt || null,
                        timeSpent: p.timeSpent || 0
                    });
                }
            });
        }

        // Update status if provided
        if (status) {
            enroll.status = status;
        }

        // Recalculate completionPercentage
        const course = await Course.findById(enroll.courseId).populate('lessons');
        if (course && course.lessons) {
            const totalLessons = course.lessons.length;
            const completedLessons = enroll.progress.filter(p => p.completedAt).length;
            enroll.completionPercentage = totalLessons > 0
                ? Math.round((completedLessons / totalLessons) * 100)
                : 0;
        }

        await enroll.save();

        // Return populated enrollment
        const updatedEnroll = await Enroll.findById(enroll._id)
            .populate('studentId', 'fullName email')
            .populate('courseId', 'title description')
            .populate('progress.lessonId', 'title');

        res.status(200).json(updatedEnroll);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE enrollment
exports.deleteEnroll = async (req, res) => {
    try {
        const enroll = await Enroll.findById(req.params.id);
        if (!enroll) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }

        // Verify if req.user is instructor of the course
        const course = await Course.findById(enroll.courseId);
        if (!course) {
            return res.status(404).json({ message: 'Associated course not found' });
        }

        // if (course.instructor.toString() !== req.user.id) {
        //     return res.status(403).json({ message: 'Not authorized' });
        // }


        //check for autherncation for the instructor
        if (course.instructor.toString() !== req.userId) {
          return   res.status(403).json({ message: 'Not authorized  to delete this enrollment ' });
        }

        await Enroll.findByIdAndDelete(req.params.id);
        return res.status(200).json({ message: 'Enrollment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};