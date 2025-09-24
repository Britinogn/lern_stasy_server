const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    lessonId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    parentId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment',  default: null }, //opitinal
    text:  { type: String, required: true },
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date },
    isHidden: { type: Boolean, default: false },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
} , { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
