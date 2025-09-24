const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    //courseId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    instructor:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description:{ type: String, required: true },
    category:  { type: String, required: true },
    price:{ type: Number, required: true },
    image: { url: String, public_id: String },
    isPublished: { type: Boolean, default: false },
    tags: [{ type: String, trim: true }],
    lessons: [{type: mongoose.Schema.Types.ObjectId, ref: 'Lesson'}]


}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
