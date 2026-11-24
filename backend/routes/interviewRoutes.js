const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  generateInterview,
  submitInterviewAnswer,
  getMyInterviewHistory,
  getInterviewById,
} = require("../controllers/interviewController");

router.use(protect);
router.use(authorizeRoles("student"));

// Generate a new interview
router.post("/generate", generateInterview);

// Submit an answer
router.post("/answer", submitInterviewAnswer);

// Get all previous interviews
router.get("/history", getMyInterviewHistory);

// Get a particular interview
router.get("/:interviewId", getInterviewById);

module.exports = router;