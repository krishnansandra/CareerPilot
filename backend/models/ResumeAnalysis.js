
const mongoose = require("mongoose");

const resumeAnalysisSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },

    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },

    scoreBreakdown: [
      {
        category: String,
        label: String,
        score: Number,
        maxScore: Number,
        feedback: String,
      },
    ],

    summary: {
      type: String,
      default: "",
    },

    strengths: [String],
    weaknesses: [String],
    technicalSkills: [String],
    softSkills: [String],
    missingSkills: [String],
    suggestions: [String],
    suitableJobRoles: [String],

    analyzedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "ResumeAnalysis",
  resumeAnalysisSchema
);
