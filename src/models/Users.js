const mongoose = require ('mongoose');

const userSchema = new mongoose.Schema({
    fullName:{ type: String, required: true,  trim: true},
    userName: { type: String, required: true, unique: true , trim: true},
    email:{ type: String, required: true, unique: true , lowercase: true, trim: true},
    password:{ type: String, required: true },
    role: { type: String,  enum: ['student', 'instructor'], default: 'student', required: true },

    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    
    createdCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }], // For instructors
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]  // For students

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
