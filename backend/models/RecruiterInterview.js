
const mongoose = require("mongoose");

const recruiterInterviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      index: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    interviewType: {
      type: String,
      enum: ["Technical", "HR", "Behavioral", "Mixed"],
      required: true,
    },

    interviewDate: {
      type: Date,
      required: true,
    },

    interviewTime: {
      type: String,
      required: true,
    },

    interviewMode: {
      type: String,
      enum: ["Online", "In-Person"],
      default: "Online",
    },

    meetingLink: {
      type: String,
      trim: true,
      default: "",
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    instructions: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["Scheduled", "Rescheduled", "Completed", "Cancelled"],
      default: "Scheduled",
    },

    studentResponse: {
      type: String,
      enum: ["Pending", "Accepted", "Declined"],
      default: "Pending",
    },

    recruiterNotes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "RecruiterInterview",
  recruiterInterviewSchema
);
