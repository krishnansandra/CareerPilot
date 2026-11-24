
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  getStudentInterviews,
  respondToInterview,
} = require("../controllers/studentInterviewController");

router.use(protect);
router.use(authorizeRoles("student"));

router.get("/", getStudentInterviews);

router.put("/:interviewId/response", respondToInterview);

module.exports = router;
