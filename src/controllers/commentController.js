const Comment = require('../models/Comment');
const Lesson = require('../models/Lessons')

// courseController.js should have:
exports.addComment = async (req, res) => {
  // your logic
  try {
    const lessonId = req.params.lessonId;
    const {content} = req.body;

    if (!content) {
      res.status(400).json({ message: 'Content required' });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      res.status(404).json({ message: 'Lesson not found' });
    }

    //create comment
    const comment = await Comment.create({lesson: lessonId , author: req.userId, content , parent: req.replyId});

    //push comment id into Lesson
    await   Lesson.findByIdAndUpdate(lessonId, {$push: { comments: comment._id}});

    //Populate author username
    await comment.populate('author', 'userName')
    res.status(201).json(comment);


  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getComment = async (req, res) => {
  // your logic
  try {
    const comments = await Comment.find({lesson: req.params.lessonId})
    .populate('author', 'userName')
    .sort({createdAt: -1})
    res.json(comments);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

exports.deleteComment = async (req, res) => {
  // your logic
};

