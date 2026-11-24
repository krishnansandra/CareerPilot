
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  createJob,
  getRecruiterJobs,
  getRecruiterJobById,
  updateJob,
  deleteJob,
} = require("../controllers/jobController");

// All job management routes require authentication
router.use(protect);

// Only recruiters can manage their job postings
router.use(authorizeRoles("recruiter"));

router.post("/", createJob);
router.get("/my-jobs", getRecruiterJobs);
router.get("/:id", getRecruiterJobById);
router.put("/:id", updateJob);
router.delete("/:id", deleteJob);

module.exports = router;
