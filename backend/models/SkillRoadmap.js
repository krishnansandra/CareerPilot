
const mongoose = require("mongoose");

const roadmapSchema = new mongoose.Schema(
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

    currentSkills: [
      {
        type: String,
        trim: true,
      },
    ],

    missingSkills: [
      {
        type: String,
        trim: true,
      },
    ],

    skillGaps: [
      {
        skill: {
          type: String,
          required: true,
        },
        importance: {
          type: String,
          enum: ["High", "Medium", "Low"],
          default: "Medium",
        },
      },
    ],


achievedSkills: [
  {
    skill: {
      type: String,
      required: true,
      trim: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    addedToProfile: {
      type: Boolean,
      default: false,
    },
  },
],


    roadmap: [
  {
    week: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    topics: [String],
    tasks: [String],
    skills: {
  type: [String],
  default: [],
},
    learningOutcome: String,

    isCompleted: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
],

    overallDuration: {
      type: String,
      default: "4 Weeks",
    },

    status: {
      type: String,
      enum: ["Not Started", "In Progress", "Completed"],
      default: "Not Started",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SkillRoadmap", roadmapSchema);
