const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
    // overall course progress percentage
    progress: {type: Number, required: true, min: 0, max: 100, default: 0}

}, { timestamps: true });

progressSchema.index({ studentId: 1, courseId: 1 });
progressSchema.index({ studentId: 1, lessonId: 1 });

module.exports = mongoose.model('Progress', progressSchema);


