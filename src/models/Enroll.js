const mongoose = require('mongoose');

const enrollSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    enrolledAt:  { type: Date, required: true },
    progress:[{
        lessonId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
        completedAt: {type: Date},
        timeSpent: {type: Number} 
    }],
    completionPercentage: {type: Number} 
} , { timestamps: true });

module.exports = mongoose.model('Enroll', enrollSchema);
