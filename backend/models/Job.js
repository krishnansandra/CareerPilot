
const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: 100,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
    },

    requiredSkills: {
      type: [String],
      default: [],
    },

    responsibilities: {
      type: [String],
      default: [],
    },

    qualifications: {
      type: [String],
      default: [],
    },

    employmentType: {
      type: String,
      enum: [
        "Full-time",
        "Part-time",
        "Internship",
        "Contract",
      ],
      required: true,
    },

    workplaceType: {
      type: String,
      enum: ["On-site", "Remote", "Hybrid"],
      required: true,
    },

    location: {
      type: String,
      trim: true,
    },

    experienceLevel: {
      type: String,
      enum: [
        "Fresher",
        "0-1 years",
        "1-3 years",
        "3-5 years",
        "5+ years",
      ],
      default: "Fresher",
    },

    salary: {
      min: {
        type: Number,
        min: 0,
      },
      max: {
        type: Number,
        min: 0,
      },
      currency: {
        type: String,
        default: "INR",
      },
    },

    vacancies: {
      type: Number,
      default: 1,
      min: 1,
    },

    applicationDeadline: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["Draft", "Open", "Closed"],
      default: "Open",
    },
  },
  {
    timestamps: true,
  }
);

jobSchema.index({ title: "text", description: "text" });
jobSchema.index({ recruiter: 1, status: 1 });
jobSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Job", jobSchema);
