
const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    coverLetter: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    resumeUrl: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "Applied",
        "Under Review",
        "Shortlisted",
        "Rejected",
        "Hired",
      ],
      default: "Applied",
    },

    appliedAt: {
      type: Date,
      default: Date.now,
    },
    recruiterEvaluation: {
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },

  strengths: {
    type: [String],
    default: [],
  },

  weaknesses: {
    type: [String],
    default: [],
  },

  notes: {
    type: String,
    default: "",
    trim: true,
  },

  evaluatedAt: {
    type: Date,
    default: null,
  },
}
  },
  { timestamps: true }
);

// A student can apply only once to the same job.
applicationSchema.index(
  { student: 1, job: 1 },
  { unique: true }
);

module.exports = mongoose.model("Application", applicationSchema);
