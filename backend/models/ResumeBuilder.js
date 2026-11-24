
const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema(
  {
    degree: { type: String, trim: true, default: "" },
    institution: { type: String, trim: true, default: "" },
    year: { type: String, trim: true, default: "" },
    grade: { type: String, trim: true, default: "" },
  },
  { _id: true }
);

const experienceSchema = new mongoose.Schema(
  {
    role: { type: String, trim: true, default: "" },
    company: { type: String, trim: true, default: "" },
    duration: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
  },
  { _id: true }
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "" },
    technologies: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
  },
  { _id: true }
);

const resumeBuilderSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    template: {
  type: String,
  enum: ["modern", "professional", "minimal"],
  default: "modern",
},

    fullName: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, lowercase: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },

    linkedin: { type: String, trim: true, default: "" },
    github: { type: String, trim: true, default: "" },
    portfolio: { type: String, trim: true, default: "" },

    summary: { type: String, trim: true, default: "" },
    skills: { type: String, trim: true, default: "" },

    education: {
      type: [educationSchema],
      default: [],
    },

    experience: {
      type: [experienceSchema],
      default: [],
    },

    projects: {
      type: [projectSchema],
      default: [],
    },

    certifications: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ResumeBuilder", resumeBuilderSchema);
