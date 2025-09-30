const express = require("express");
const auth = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const { getInstructorDashboard } = require("../controllers/instructorController");

const router = express.Router();

router.get("/dashboard", auth, requireRole("instructor"), getInstructorDashboard);

module.exports = router;