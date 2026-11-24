
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  getMyResume,
  saveMyResume,
  updateMyResume,
} = require("../controllers/resumeBuilderController");

// All routes require student authentication
router.use(protect);
router.use(authorizeRoles("student"));

// Get saved resume
router.get("/", getMyResume);

// Save resume
router.post("/", saveMyResume);

// Update resume
router.put("/", updateMyResume);

module.exports = router;
