
const Job = require("../models/Job");

// Escape special characters in search input
const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Get available jobs for students
const getStudentJobs = async (req, res) => {
  try {
    const {
      search,
      employmentType,
      workplaceType,
      location,
      experienceLevel,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {
      status: "Open",
    };

    // Search by job title, description, company or skills
    if (search && search.trim()) {
      const searchRegex = new RegExp(escapeRegex(search.trim()), "i");

      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { companyName: searchRegex },
        { requiredSkills: searchRegex },
      ];
    }

    if (employmentType) {
      filter.employmentType = employmentType;
    }

    if (workplaceType) {
      filter.workplaceType = workplaceType;
    }

    if (location) {
      filter.location = {
        $regex: escapeRegex(location.trim()),
        $options: "i",
      };
    }

    if (experienceLevel) {
      filter.experienceLevel = experienceLevel;
    }

    const currentPage = Math.max(1, Number(page) || 1);
    const pageLimit = Math.min(50, Math.max(1, Number(limit) || 10));

    const totalJobs = await Job.countDocuments(filter);

    const jobs = await Job.find(filter)
      .populate("recruiter", "name")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * pageLimit)
      .limit(pageLimit);

    res.status(200).json({
      success: true,
      totalJobs,
      currentPage,
      totalPages: Math.ceil(totalJobs / pageLimit),
      jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch available jobs",
      error: error.message,
    });
  }
};


const mongoose = require("mongoose");

const getStudentJobById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const job = await Job.findOne({
      _id: id,
      status: "Open",
    }).populate("recruiter", "name");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or no longer available",
      });
    }

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch job details",
      error: error.message,
    });
  }
};


module.exports = {
  getStudentJobs,getStudentJobById
};
