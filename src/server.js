require('dotenv').config();

const express = require('express');
const cors = require('cors');
// const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const testEmailRoute  = require("./routes/testRoutes");



// dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser())

// Routes
app.use('/api/auth', require('./routes/authRoute'));
app.use('/api/courses', require('./routes/courseRoute'));
app.use('/api/lessons', require('./routes/lessonRoute'));
app.use('/api/courses/:courseId/lesson', require('./routes/lessonRoute'));
app.use('/api/lessons/:lessonId/progress', require('./routes/progressRoute'));

app.use('/api/lessons/:lessonId/comments', require('./routes/commentRoute'));
app.use('/api/courses/:courseId/enrollments', require('./routes/enrollRoute'));

app.use('/api/courses/:courseId/progress', require('./routes/progressRoute'));

app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/instructor", require("./routes/instructorRoutes"));

app.use("/api", testEmailRoute);
/**
  
 */

//app.use('/api/courses/:courseId/lessons', require('./routes/lessonRoute'));

//app.use('api/lessons/:lessonId/comments', require('./routes/commentRoute'));
// router.post('/posts/:postId/comments', addComment);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log( ` 🚀 Server running on ${PORT}`));