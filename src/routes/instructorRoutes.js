const express = require("express");
const auth = require("../middleware/authMiddleware");
const { requireRole } = require('../middleware/roleMiddleware')
const User = require("../models/Users");
const router = express.Router();

// Instructor dashboard → get created courses
router.get("/dashboard",auth, requireRole('instructor'), async (req, res) => {
  try {
    const instructor = await User.findById(req.userId).populate("createdCourses");

    res.json({
      success: true,
      message: "Welcome to the Instructor Dashboard",
      user: { id: req.userId, role: req.userRole },
      courses: instructor.createdCourses,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load instructor dashboard" });
  }
});

module.exports = router;
