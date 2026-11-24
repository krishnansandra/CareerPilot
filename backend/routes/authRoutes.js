const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  getCurrentUser,
} = require("../controllers/authController");
const authorizeRoles = require("../middleware/roleMiddleware");

const protect = require("../middleware/authMiddleware");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected route
router.get("/me", protect, getCurrentUser);
// Student-only route
router.get(
  "/student-access",
  protect,
  authorizeRoles("student"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome to Student Dashboard",
      user: req.user,
    });
  }
);

// Recruiter-only route
router.get(
  "/recruiter-access",
  protect,
  authorizeRoles("recruiter"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome to Recruiter Dashboard",
      user: req.user,
    });
  }
);

// Admin-only route
router.get(
  "/admin-access",
  protect,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome to Admin Dashboard",
      user: req.user,
    });
  }
);

module.exports = router;