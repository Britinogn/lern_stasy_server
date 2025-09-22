const mongoose = require('mongoose');

const lessonsSchema = new mongoose.Schema({
    courseId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    content:{ type: String, required: true },
    video: { url: {type: String},  public_id: { type: String } },
    videoLink: { type: String },
    duration:{ type: Number, required: true },
    //isPublished: { type: Boolean, required: true },

}, { timestamps: true });

module.exports = mongoose.model('Lessons', lessonsSchema);
