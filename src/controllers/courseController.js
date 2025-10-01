const Course = require('../models/Course')
const Cloudinary = require('../config/cloudinary');

//   GET all course
exports.getCourses = async (req, res) => {
  
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const totalPages = await Course.countDocuments();
    const courses = await Course.find()
      .populate('instructor', 'fullName  userName')
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));
    res.json({ totalPages, page: Number(page), limit: Number(limit), courses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }

};

exports.getCourse = async (req, res) => {
  // my logic
  try {
    const course = await Course.findById(req.params.id)
    .populate('instructor', 'fullName')
    .populate({
      path: 'lessons',
      options:{sort: {createdAt: -1}},
      populate: {path: 'instructor', select: 'userName'} // "Select" should be "select" (lowercase)populate: {path: 'instructor', Select: 'userName'}
    })

  if(!course) return res.status(404).json({message: 'Course Not Found'})
  res.json(course);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
};

//create[POST] a new course 
exports.createCourse = async (req, res) => {
  try {
    const {title, description, category, price, tags } = req.body;

    if (!title || !description || !category || price === undefined) {
      return res.status(400).json({ 
          message: 'title, description, category, and price are required' 
      });
    }

    // Create course with instructor ID from JWT token
    const course = await Course.create( { 
      title, 
      description, 
      category, 
      price , 
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      instructor: req.userId
    });

    //handle image upload if present

    if(req.file && req.file.path){
      course.image = {
        url: req.file.path, 
        public_id: req.file.filename
    }

      await course.save();
    }


    res.status(201).json({
        message: 'Course created successfully!',
        courseId: course._id,
        course
    });
    //create course 
    // const course = await Course.create(courseData);
    // res.status(201).json(course)

  } catch (err) {
    res.status(500).json({ message: err.message });  
  }
  
};
 
// 
exports.updateCourse = async (req, res) => {
  // my logic
  try {
    const course = await Course.findById(req.params.id);
    if(!course) return res.status(404).json({ message: 'Course not found' });
    if(course.instructor.toString() !==  req.userId ) return res.status(403).json({ message: 'Not authorized' });
  
    const {title, description, category,price, tags } = req.body;
    course.title = title ?? course.title;   
    course.description = description ?? course.description;
    course.category = category ?? course.category;
    course.price = price ?? course.price;
    course.tags = tags ?? course.tags;
    course.tags = tags ? tags.split(',').map(t => t.trim()) : course.tags;

    if (req.file && req.file.path) {
      course.image = { url: req.file.path, public_id: req.file.filename};
    }

    await course.save();
    res.json(course)
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELLETE Course
exports.deleteCourse = async (req, res) => {
  // my logic

  try {
    const course = await Course.findById(req.params.id);
    if(!course) return res.status(404).json({message: 'Course not found'});

    //check for autherncation for the instructor
    if (course.instructor.toString() !== req.userId){
      res.status(403).json({ message: 'Not authorized' });
    }

    //cloudinary Deletion if present
    if (course.image && course.image.public_id ) {
      try {
        await Cloudinary.uploader.destroy(course.image.public_id)
      } catch (e) {
        console.error('Cloudinary deletion error', e); 
      }
    }

    //delete comments belonging to a Course(Lesson)
    // await Lessons.deleteMany({course: course._id})

      return res.json({ message: 'Courses and its Lessons deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};


// Example: backend controller
exports.getInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.userId }); 
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch instructor courses" });
  }
};



