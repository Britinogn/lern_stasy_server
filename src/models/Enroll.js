const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    enrolledAt:  { type: Date, required: true , default: Date.now},
    progress:[{
        lessonId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
        completedAt: {type: Date},
        timeSpent: {type: Number} 
    }],
    status: { type: String, enum: ['active', 'completed', 'paused', 'dropped'], default: 'active' },
    completionPercentage: {type: Number} ,
} , { timestamps: true });

module.exports = mongoose.model('Enroll', enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true })
);
