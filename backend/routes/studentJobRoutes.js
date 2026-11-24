
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  getStudentJobs,  getStudentJobById,
} = require("../controllers/studentJobController");

// All routes require student authentication
router.use(protect);
router.use(authorizeRoles("student"));

// GET /api/student/jobs
router.get("/", getStudentJobs);

router.get("/:id", getStudentJobById);


module.exports = router;
