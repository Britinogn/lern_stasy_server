const Lesson = require('../models/Lessons');
const Course = require('../models/Course.js')

// courseController.js should have:
exports.getLessons = async (req, res) => {
  // my logic

  try {
    const courses = await Course.find({});
    res.json(courses);
  } catch (error) {
    
  }
};

exports.getLesson = async (req, res) => {
  // your logic
};

exports.addLesson = async (req, res) => {
  try {
    const {title, content, video, videoLink, duration} = req.body;

    if (!title || !content || !duration) {
      return res.status(400).json({ 
          message: 'title, content, and duration are required' 
      });
    }

    if (!video && !videoLink) {
      return res.status(400).json({ message: "Either video or videoLink is required" });
    }

    const course = await Course.findOne({customId: req.params.courseId});
    if(!course) return res.status(404).json({message: 'Invalid course ID'});

    if (course.instructor.toString() !== req.userId) {
      return res.status(403).json({message: 'Unauthorized'})
    }

    const lesson = await Lesson.create({
      courseId: req.body.courseId,
      title, 
      content, 
      video, 
      videoLink, 
      duration,
      instructor: req.userId
    });

    res.status(201).json({
      message: 'Lesson created successfully',
      lesson
    });

    course.lessons.push(lesson._id);
    await course.save();

  } catch (err) {
    res.status(500).json({ message: err.message });  
  }
};

exports.editLesson = async (req, res) => {
  // your logic
};

exports.deleteLesson = async (req, res) => {
  // your logic
};