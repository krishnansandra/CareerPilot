
const express = require("express");
const router = express.Router();


const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  applyForJob,getMyApplications,
} = require("../controllers/applicationController");

// Only authenticated students can apply
router.use(protect);
router.use(authorizeRoles("student"));

router.get("/my-applications", getMyApplications);
router.post("/:jobId", applyForJob);

module.exports = router;

