
const Job = require("../models/Job");
const RecruiterProfile = require("../models/RecruiterProfile");

// Create a new job
const createJob = async (req, res) => {
  try {
    const recruiterProfile = await RecruiterProfile.findOne({
      user: req.user.id,
    });

    if (!recruiterProfile) {
      return res.status(400).json({
        success: false,
        message: "Please complete your company profile before posting a job",
      });
    }

    if (recruiterProfile.verificationStatus !== "verified") {
      return res.status(403).json({
        success: false,
        message: "Your company must be verified before posting jobs",
      });
    }

    const {
      title,
      description,
      requiredSkills,
      responsibilities,
      qualifications,
      employmentType,
      workplaceType,
      location,
      experienceLevel,
      salary,
      vacancies,
      applicationDeadline,
      status,
    } = req.body;

    const job = await Job.create({
      recruiter: req.user.id,
      title,
      companyName: recruiterProfile.companyName,
      description,
      requiredSkills,
      responsibilities,
      qualifications,
      employmentType,
      workplaceType,
      location,
      experienceLevel,
      salary,
      vacancies,
      applicationDeadline,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Job posted successfully",
      job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get jobs posted by logged-in recruiter
const getRecruiterJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
      recruiter: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get one job belonging to logged-in recruiter
const getRecruiterJobById = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      recruiter: req.user.id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update recruiter job
const updateJob = async (req, res) => {
  try {
    const allowedFields = [
      "title",
      "description",
      "requiredSkills",
      "responsibilities",
      "qualifications",
      "employmentType",
      "workplaceType",
      "location",
      "experienceLevel",
      "salary",
      "vacancies",
      "applicationDeadline",
      "status",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const job = await Job.findOneAndUpdate(
      {
        _id: req.params.id,
        recruiter: req.user.id,
      },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete recruiter job
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      recruiter: req.user.id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createJob,
  getRecruiterJobs,
  getRecruiterJobById,
  updateJob,
  deleteJob,
};
