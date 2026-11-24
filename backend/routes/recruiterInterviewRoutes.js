
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  scheduleInterview,
  getRecruiterInterviews,
  rescheduleInterview,
  cancelInterview,
  completeInterview,
} = require("../controllers/recruiterInterviewController");

router.use(protect);
router.use(authorizeRoles("recruiter"));

// Schedule an interview for an applicant
router.post("/:applicationId/schedule", scheduleInterview);

// Get all interviews scheduled by the recruiter
router.get("/my-interviews", getRecruiterInterviews);

// Reschedule an interview
router.put("/:interviewId/reschedule", rescheduleInterview);

// Cancel an interview
router.put("/:interviewId/cancel", cancelInterview);

// Mark an interview as completed
router.put("/:interviewId/complete", completeInterview);

module.exports = router;
