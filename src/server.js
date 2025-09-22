const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
    app.use(cors());
    app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoute'));
app.use('/api/courses', require('./routes/courseRoute'));
app.use('/api/lessons', require('./routes/lessonRoute'));
app.use('/api/comments', require('./routes/commentRoute'));

app.use('/api/courses/:courseId/lessons', require('./routes/lessonRoute'));

app.use('api/lessons/:lessonId/comments', require('./routes/commentRoute'));
// router.post('/posts/:postId/comments', addComment);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log( ` 🚀 Server running on port ${PORT}`));