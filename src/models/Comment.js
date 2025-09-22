const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    lessonId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    parentId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment', required: true }, //opitinal
    content:  { type: String, required: true }
} , { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
