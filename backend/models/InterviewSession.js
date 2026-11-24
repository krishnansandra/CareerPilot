
const mongoose = require("mongoose");

const interviewSessionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    targetRole: {
      type: String,
      required: true,
      trim: true,
    },

    interviewType: {
      type: String,
      enum: ["Technical", "HR", "Behavioral", "Mixed"],
      required: true,
    },

    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Intermediate",
    },

    questions: [
      {
        question: {
          type: String,
          required: true,
        },

        answer: {
          type: String,
          default: "",
        },

        score: {
          type: Number,
          min: 0,
          max: 10,
          default: null,
        },

        feedback: {
          type: String,
          default: "",
        },

        strengths: {
          type: [String],
          default: [],
        },

        improvements: {
          type: [String],
          default: [],
        },

        answeredAt: {
          type: Date,
          default: null,
        },
      },
    ],

    overallScore: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },

    overallFeedback: {
      type: String,
      default: "",
    },

    completedQuestions: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["In Progress", "Completed"],
      default: "In Progress",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "InterviewSession",
  interviewSessionSchema
);
