
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  getAllRecruiters,
  updateRecruiterVerification,
  getAdminDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAllJobs,
  getAdminJobById,
  updateAdminJobStatus,
  deleteAdminJob, getAdminReports,
} = require("../controllers/adminController");

router.use(protect);
router.use(authorizeRoles("admin"));

// User management
router.get("/users", getAllUsers);
router.put("/users/:id/status", updateUserStatus);

// Recruiter management
router.get("/recruiters", getAllRecruiters);
router.put("/recruiters/:id/verification", updateRecruiterVerification);

// Admin dashboard
router.get("/dashboard-stats", getAdminDashboardStats);

// Job management
router.get("/jobs", getAllJobs);
router.get("/jobs/:id", getAdminJobById);
router.put("/jobs/:id/status", updateAdminJobStatus);
router.delete("/jobs/:id", deleteAdminJob);
// Admin Reports
router.get("/reports", getAdminReports);

module.exports = router;
