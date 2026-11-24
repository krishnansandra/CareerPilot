
const mongoose = require("mongoose");

const RecruiterProfile = require("../models/RecruiterProfile");
const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");

// Get all recruiter profiles for admin review
const getAllRecruiters = async (req, res) => {
  try {
    const recruiters = await RecruiterProfile.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalRecruiters: recruiters.length,
      recruiters,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch recruiter profiles",
      error: error.message,
    });
  }
};

// Approve or reject recruiter verification
const updateRecruiterVerification = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be verified or rejected",
      });
    }

    const recruiter = await RecruiterProfile.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: status },
      { new: true, runValidators: true }
    ).populate("user", "name email");

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: "Recruiter profile not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Recruiter ${status} successfully`,
      recruiter,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to update recruiter verification",
      error: error.message,
    });
  }
};

// Get Admin Dashboard Statistics
const getAdminDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalRecruiters,
      totalJobs,
      pendingRecruiters,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "recruiter" }),
      Job.countDocuments(),
      RecruiterProfile.countDocuments({
        verificationStatus: "pending",
      }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalRecruiters,
        totalJobs,
        pendingRecruiters,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch admin dashboard statistics",
      error: error.message,
    });
  }
};

// Get all registered users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalUsers: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch users",
      error: error.message,
    });
  }
};

// Activate or deactivate a user account
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin accounts cannot be modified here",
      });
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to update user status",
      error: error.message,
    });
  }
};

// Get all job postings
const getAllJobs = async (req, res) => {
  try {
    const { search, status } = req.query;

    const filter = {};

    if (status && ["Open", "Closed", "Draft"].includes(status)) {
      filter.status = status;
    }

    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { companyName: { $regex: search.trim(), $options: "i" } },
        { location: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const jobs = await Job.find(filter)
      .populate("recruiter", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalJobs: jobs.length,
      jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch job postings",
      error: error.message,
    });
  }
};

// Get a single job's details
const getAdminJobById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const job = await Job.findById(id).populate(
      "recruiter",
      "name email"
    );

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
      message: "Unable to fetch job details",
      error: error.message,
    });
  }
};

// Close or reopen a job posting
const updateAdminJobStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Open", "Closed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be Open or Closed",
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate("recruiter", "name email");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Job ${status === "Open" ? "reopened" : "closed"} successfully`,
      job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to update job status",
      error: error.message,
    });
  }
};

// Delete a job posting
const deleteAdminJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Preserve application history
    const applicationCount = await Application.countDocuments({
      job: id,
    });

    if (applicationCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "This job has applications and cannot be deleted. Please close it instead.",
      });
    }

    await Job.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Job posting deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to delete job posting",
      error: error.message,
    });
  }
};


// Get Admin Reports and Analytics
const getAdminReports = async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalRecruiters,
      totalAdmins,
      activeUsers,
      verifiedRecruiters,
      pendingRecruiters,
      rejectedRecruiters,
      totalJobs,
      openJobs,
      closedJobs,
      draftJobs,
      totalApplications,
      applicationStats,
      recentUsers,
      recentJobs,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "recruiter" }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ isActive: true }),

      RecruiterProfile.countDocuments({
        verificationStatus: "verified",
      }),
      RecruiterProfile.countDocuments({
        verificationStatus: "pending",
      }),
      RecruiterProfile.countDocuments({
        verificationStatus: "rejected",
      }),

      Job.countDocuments(),
      Job.countDocuments({ status: "Open" }),
      Job.countDocuments({ status: "Closed" }),
      Job.countDocuments({ status: "Draft" }),

      Application.countDocuments(),

      Application.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      User.find()
        .select("name email role isActive createdAt")
        .sort({ createdAt: -1 })
        .limit(5),

      Job.find()
        .populate("recruiter", "name email")
        .select("title companyName status location createdAt")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    // Prepare application status counts
    const applicationStatuses = [
      "Applied",
      "Under Review",
      "Shortlisted",
      "Rejected",
      "Hired",
    ];

    const applicationBreakdown = applicationStatuses.map((status) => {
      const result = applicationStats.find(
        (item) => item._id === status
      );

      return {
        status,
        count: result ? result.count : 0,
      };
    });

    res.status(200).json({
      success: true,

      userStatistics: {
        totalUsers,
        totalStudents,
        totalRecruiters,
        totalAdmins,
        activeUsers,
      },

      recruiterStatistics: {
        verifiedRecruiters,
        pendingRecruiters,
        rejectedRecruiters,
      },

      jobStatistics: {
        totalJobs,
        openJobs,
        closedJobs,
        draftJobs,
      },

      applicationStatistics: {
        totalApplications,
        statusBreakdown: applicationBreakdown,
      },

      recentActivity: {
        recentUsers,
        recentJobs,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to generate admin reports",
      error: error.message,
    });
  }
};


module.exports = {
  getAllRecruiters,
  updateRecruiterVerification,
  getAdminDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAllJobs,
  getAdminJobById,
  updateAdminJobStatus,
  deleteAdminJob, getAdminReports,
};
