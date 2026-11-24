
const express = require("express");
const router = express.Router();

const {
  generateSkillRoadmap,
  getMySkillRoadmaps, updateWeeklyProgress,  addAchievedSkillToProfile,

} = require("../controllers/skillRoadmapController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");


// Protect all routes
router.use(protect);
router.use(authorizeRoles("student"));

// Generate a new skill roadmap
router.post("/generate", generateSkillRoadmap);

// Get all saved skill roadmaps
router.get("/my-roadmaps", getMySkillRoadmaps);
// Update weekly learning progress
router.put(
  "/:roadmapId/week/:week",
  updateWeeklyProgress
);
// Add an achieved skill to the student's profile
router.post(
  "/:roadmapId/achieved-skills",
  addAchievedSkillToProfile
);

module.exports = router;
