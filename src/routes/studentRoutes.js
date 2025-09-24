const express = require("express");
const auth = require("../middleware/authMiddleware");
const { requireRole } = require('../middleware/roleMiddleware')
const User = require("../models/Users");
const router = express.Router();

// Get student dashboard (basic)
router.get("/dashboard", auth, requireRole('student'), async (req, res) => {
  try {
    const student = await User.findById(req.userId).populate("enrolledCourses");
    res.json({
      success: true,
      message: "Welcome to the Student Dashboard",
      user: { id: req.userId, role: req.userRole },
      courses: student.enrolledCourses
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load courses" });
  }
});

module.exports = router;
















