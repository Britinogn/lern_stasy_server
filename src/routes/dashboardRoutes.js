// const express = require("express");
// const { auth, requireRole } = require("../middleware/authMiddleware");
// const router = express.Router();

// // Student dashboard
// router.get("/student/dashboard", auth, requireRole("student"), (req, res) => {
//   res.json({
//     success: true,
//     message: "Welcome to the Student Dashboard",
//     user: { id: req.userId, role: req.userRole },
//   });
// });

// // Instructor dashboard
// router.get("/instructor/dashboard", auth, requireRole("instructor"), (req, res) => {
//   res.json({
//     success: true,
//     message: "Welcome to the Instructor Dashboard",
//     user: { id: req.userId, role: req.userRole },
//   });
// });

// // Admin dashboard
// router.get("/admin/dashboard", auth, requireRole("admin"), (req, res) => {
//   res.json({
//     success: true,
//     message: "Welcome to the Admin Dashboard",
//     user: { id: req.userId, role: req.userRole },
//   });
// });

// // Generic dashboard (just returns role info)
// router.get("/dashboard", auth, (req, res) => {
//   res.json({
//     success: true,
//     message: "Redirect user based on role",
//     role: req.userRole,
//   });
// });

// module.exports = router;
