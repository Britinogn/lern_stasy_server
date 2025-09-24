const Comment = require('../models/Comment');
const Lesson = require('../models/Lessons')

// courseController.js should have:
exports.addComment = async (req, res) => {
  // your logic
  try {
    const lessonId = req.params.lessonId || req.body.lessonId;;
    const {text} = req.body;

    if (!text) {
      res.status(400).json({ message: 'Text required' });
    }


    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      res.status(404).json({ message: 'Lesson not found' });
    }

    //create comment
    const comment = await Comment.create({
      lessonId: lessonId , 
      user: req.userId, 
      text , 
      parentId: null
    });

    //push comment id into Lesson
    await   Lesson.findByIdAndUpdate(lessonId, {$push: { comments: comment._id}});

    // Populate user info
    await comment.populate('user', 'userName');
    res.status(201).json(comment);


  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getComments = async (req, res) => {
  
  try {
    const comments = await Comment.find({lessonId: req.params.lessonId})
    .populate('user', 'userName')
    .sort({createdAt: -1})
    res.json(comments);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

exports.addReply = async (req, res) => {
  try {
    const {id: parentId} = req.params;
    const {text} = req.body;
    const lessonId = req.params.lessonId;

    if (!text) {
      return res.status(400).json({ message: 'Text required' });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    // Check if parent comment exists
    const parentComment = await Comment.findById(parentId);
    if (!parentComment) {
      return res.status(404).json({ message: 'Parent comment not found' });
    }

    const reply = await Comment.create({
      lessonId: lessonId,
      user: req.user.id,
      text: text,
      parentId: parentId
    });

    await Lesson.findByIdAndUpdate(lessonId, { $push: { comments: reply._id } });


    await reply.populate('user', 'userName');
    res.status(201).json(reply);


  } catch (error) {
    
  }
}

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({message: 'Comment not found'});

    // Check if user owns the comment
    if(comment.user.toString() !== req.userId ){
      return res.status(403).json({ message: 'Not authorized' });
    };

    // remove comment doc
    await Comment.findByIdAndDelete(req.params.id);

    // pull comment id from Lesson comments
    await  Lesson.findByIdAndUpdate(comment.lessonId, { $pull: { comments: comment._id } });

   return res.json({ message: 'Comment deleted' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};



// Instructor comment
// exports.addInstructorComment = async (req, res) => {
//   try {
//     const { text } = req.body;
//     if (!text) return res.status(400).json({ message: "Text is required" });

//     const lesson = await Lesson.findById(req.params.lessonId);
//     if (!lesson) return res.status(404).json({ message: "Lesson not found" });

//     const comment = await Comment.create({
//       lesson: lesson._id,
//       user: req.userId,
//       role: "instructor",
//       text,
//       parentId: null
//     });

//     res.status(201).json({ message: "Instructor comment added", comment });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };