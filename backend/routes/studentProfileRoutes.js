
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  getStudentProfile,
  createStudentProfile,
  updateStudentProfile,
} = require("../controllers/studentProfileController");

// All routes require student authentication
router.use(protect);
router.use(authorizeRoles("student"));

// Get student profile
router.get("/profile", getStudentProfile);

// Create student profile
router.post("/profile", createStudentProfile);

// Update student profile
router.put("/profile", updateStudentProfile);

module.exports = router;
