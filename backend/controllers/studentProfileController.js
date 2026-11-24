
const StudentProfile = require("../models/StudentProfile");

// @desc    Get logged-in student's profile
// @route   GET /api/student/profile
// @access  Student
const getStudentProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({
      user: req.user.id,
    }).populate("user", "name email role");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create student profile
// @route   POST /api/student/profile
// @access  Student

const createStudentProfile = async (req, res) => {
  try {
    const existingProfile = await StudentProfile.findOne({
      user: req.user.id,
    });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "Student profile already exists",
      });
    }

    const {
      phone,
      location,
      professionalSummary,
      education,
      skills,
      experience,
      projects,
      careerInterests,
      preferredJobRoles,
      portfolioUrl,
      linkedinUrl,
      githubUrl,
    } = req.body;

    const profile = await StudentProfile.create({
      user: req.user.id,
      phone,
      location,
      professionalSummary,
      education,
      skills,
      experience,
      projects,
      careerInterests,
      preferredJobRoles,
      portfolioUrl,
      linkedinUrl,
      githubUrl,
    });

    res.status(201).json({
      success: true,
      message: "Student profile created successfully",
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateStudentProfile = async (req, res) => {
  try {
    const allowedFields = [
      "phone",
      "location",
      "professionalSummary",
      "education",
      "skills",
      "experience",
      "projects",
      "careerInterests",
      "preferredJobRoles",
      "portfolioUrl",
      "linkedinUrl",
      "githubUrl",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const profile = await StudentProfile.findOneAndUpdate(
      { user: req.user.id },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    ).populate("user", "name email role");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student profile updated successfully",
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getStudentProfile,
  createStudentProfile,
  updateStudentProfile,
};

