
const RecruiterProfile = require("../models/RecruiterProfile");

// Get recruiter profile
const getRecruiterProfile = async (req, res) => {
  try {
    const profile = await RecruiterProfile.findOne({
      user: req.user.id,
    }).populate("user", "name email role");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Recruiter profile not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Recruiter profile retrieved successfully",
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create recruiter profile
const createRecruiterProfile = async (req, res) => {
  try {
    const existingProfile = await RecruiterProfile.findOne({
      user: req.user.id,
    });

    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: "Recruiter profile already exists",
      });
    }

    const {
      companyName,
      industry,
      companySize,
      website,
      location,
      description,
      logoUrl,
      contactEmail,
      contactPhone,
    } = req.body;

    const profile = await RecruiterProfile.create({
      user: req.user.id,
      companyName,
      industry,
      companySize,
      website,
      location,
      description,
      logoUrl,
      contactEmail,
      contactPhone,
    });

    res.status(201).json({
      success: true,
      message: "Recruiter profile created successfully",
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update recruiter profile
const updateRecruiterProfile = async (req, res) => {
  try {
    const allowedFields = [
      "companyName",
      "industry",
      "companySize",
      "website",
      "location",
      "description",
      "logoUrl",
      "contactEmail",
      "contactPhone",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const profile = await RecruiterProfile.findOneAndUpdate(
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
        message: "Recruiter profile not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Recruiter profile updated successfully",
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
  getRecruiterProfile,
  createRecruiterProfile,
  updateRecruiterProfile,
};
