
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const uploadResume = require("../middleware/uploadResume");


const {
  uploadStudentResume,
  analyzeStudentResume,downloadStudentResume,getRecommendedJobs,  getStudentResume,getSavedResumeAnalysis,
} = require("../controllers/resumeController");

// Protect all resume routes
router.use(protect);
router.use(authorizeRoles("student"));

// Upload a PDF resume
router.post(
  "/upload",
  uploadResume.single("resume"),
  uploadStudentResume
);
// Analyze uploaded resume using Gemini AI
router.post("/analyze", analyzeStudentResume);
router.get("/download", downloadStudentResume);
router.get("/recommendations", getRecommendedJobs);
// Get existing student resume
router.get("/my-resume", getStudentResume);
router.get("/saved-analysis", getSavedResumeAnalysis);


module.exports = router;
