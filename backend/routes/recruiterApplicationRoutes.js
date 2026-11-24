
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  getRecruiterApplicants,
  updateApplicationStatus,
  getApplicantResume, evaluateApplicant,compareApplicantsWithAI,
} = require("../controllers/applicationController");

router.use(protect);
router.use(authorizeRoles("recruiter"));

router.get("/applicants", getRecruiterApplicants);

router.put(
  "/applications/:applicationId/status",
  updateApplicationStatus
);

// View or download an applicant's resume
router.get(
  "/applications/:applicationId/resume",
  getApplicantResume
);

router.put(
  "/applications/:applicationId/evaluation",
  evaluateApplicant
);

router.post("/applicants/compare", compareApplicantsWithAI);
module.exports = router;
