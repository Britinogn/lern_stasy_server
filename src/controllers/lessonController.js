const Lesson = require('../models/Lessons');
const Course = require('../models/Course')
const Comment = require('../models/Comment')
// GET Alllessons
exports.getLessons = async (req, res) => {
  // my logic

  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const total = await Lesson.countDocuments();
    const lessons = await Lesson.find()
      .populate('instructor')
      .sort({createdAt: -1})
      .skip(Number(skip))
      .limit(Number(limit))
    res.json({ total, page: Number(page), limit: Number(limit), lessons });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//GET lesson (only enrolled students)
exports.getLesson = async (req, res) => {
  // my logic
  try {
    const lesson = await Lesson.findById(req.params.id)
    .populate('instructor',  'userName email')
    .populate({
      path: 'comments',
      options:{sort: {createdAt: -1}},
      populate: {path: 'instructor', select: 'userName'}  // "Select" should be "select" (lowercase)populate: {path: 'instructor', Select: 'userName'}
    })

    if(!lesson) return res.status(404).json({message: 'Lesson Not Found'})
    res.json(lesson);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }

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


    const courseId = req.params.courseId || req.body.courseId;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Invalid course ID' });


    // const course = await Course.findById(req.params.courseId); // Fix: Use _id for Mongoose
    // if(!course) return res.status(404).json({message: 'Invalid course ID'});

    if (course.instructor.toString() !== req.userId) {
      return res.status(403).json({message: 'Unauthorized: only the course instructor can add lessons'})
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
  // my logic
  try {
    const lesson = await Lesson.findById(req.params.courseId);
    if(!lesson) return res.status(404).json({message: 'Lesson not found'})
    if(!lesson.instructor || lesson.instructor.toString() !==  req.params.courseId ) return res.status(403).json({ message: 'Not authorized' });
    
    const {title, content, duration} = req.body;
    lesson.title = title ?? lesson.title;
    lesson.content = content ?? lesson.content;
    lesson.duration = duration ?? lesson.duration;

    if (req.file && req.file.path) {
      lesson.video = { url: req.file.path, public_id: req.file.filename};
    }
    await lesson.save();
    res.json(lesson)
  } catch (err) {
    res.status(500).json({ message: err.message });
  }


};

//DELETE Lesson
exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById({customId: req.params.id});
    if(!lesson) return res.status(404).json({message: 'Lesson not found'})

    //check for autherncation for the instructor
    if (lesson.instructor.toString() !== req.userId){
      res.status(403).json({ message: 'Not authorized' });
    }

    // Optional: Delete associated comments first
    await Comment.deleteMany({ lessonId: lesson._id });

    // Remove the lesson reference from the course
    await Course.findByIdAndUpdate(lesson.courseId, { $pull: { lessons: lesson._id } });

    // Delete the lesson
    await Lesson.findByIdAndDelete(req.params.id);


    return res.json({ message: 'Lesson and its comments deleted' });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};