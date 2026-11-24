
const ResumeBuilder = require("../models/ResumeBuilder");

// @desc    Get the logged-in student's resume
// @route   GET /api/resume-builder
// @access  Student
const getMyResume = async (req, res) => {
  try {
    const resume = await ResumeBuilder.findOne({
      student: req.user.id,
    });

    return res.status(200).json({
      success: true,
      resume,
    });
  } catch (error) {
    console.error("Get resume builder error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve resume.",
    });
  }
};

// @desc    Create or save the student's resume
// @route   POST /api/resume-builder
// @access  Student
const saveMyResume = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      location,
      linkedin,
      github,
      portfolio,
      summary,
      skills,
      education,
      experience,
      projects,
      certifications,
      template,
    } = req.body;

    const resumeData = {
      fullName,
      email,
      phone,
      location,
      linkedin,
      github,
      portfolio,
      summary,
      skills,
      education,
      experience,
      projects,
      certifications,
      template,
    };

    const resume = await ResumeBuilder.findOneAndUpdate(
      { student: req.user.id },
      {
        $set: {
          ...resumeData,
          student: req.user.id,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Resume saved successfully.",
      resume,
    });
  } catch (error) {
    console.error("Save resume builder error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to save resume.",
    });
  }
};

// @desc    Update the student's resume
// @route   PUT /api/resume-builder
// @access  Student
const updateMyResume = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      location,
      linkedin,
      github,
      portfolio,
      summary,
      skills,
      education,
      experience,
      projects,
      certifications,
    } = req.body;

    const resume = await ResumeBuilder.findOneAndUpdate(
      { student: req.user.id },
      {
        $set: {
          fullName,
          email,
          phone,
          location,
          linkedin,
          github,
          portfolio,
          summary,
          skills,
          education,
          experience,
          projects,
          certifications,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found. Please save your resume first.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Resume updated successfully.",
      resume,
    });
  } catch (error) {
    console.error("Update resume builder error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update resume.",
    });
  }
};

module.exports = {
  getMyResume,
  saveMyResume,
  updateMyResume,
};
