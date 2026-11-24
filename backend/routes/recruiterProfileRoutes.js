
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  getRecruiterProfile,
  createRecruiterProfile,
  updateRecruiterProfile,
} = require("../controllers/recruiterProfileController");

// Protect all recruiter profile routes
router.use(protect);
router.use(authorizeRoles("recruiter"));

// Profile APIs
router.get("/profile", getRecruiterProfile);
router.post("/profile", createRecruiterProfile);
router.put("/profile", updateRecruiterProfile);

module.exports = router;
