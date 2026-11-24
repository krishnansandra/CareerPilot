
const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema(
  {
    qualification: {
      type: String,
      trim: true,
    },
    institution: {
      type: String,
      trim: true,
    },
    specialization: {
      type: String,
      trim: true,
    },
    graduationYear: {
      type: Number,
    },
    grade: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const experienceSchema = new mongoose.Schema(
  {
    jobTitle: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    employmentType: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startDate: Date,
    endDate: Date,
    currentlyWorking: {
      type: Boolean,
      default: false,
    },
  }
);

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    technologies: [String],
    projectUrl: String,
  }
);

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
    },

    professionalSummary: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    education: [educationSchema],

    skills: {
      type: [String],
      default: [],
    },

    experience: [experienceSchema],

    projects: [projectSchema],

    careerInterests: {
      type: [String],
      default: [],
    },

    preferredJobRoles: {
      type: [String],
      default: [],
    },

    portfolioUrl: String,

    linkedinUrl: String,

    githubUrl: String,
  },
  {
    timestamps: true,
  }
);

const StudentProfile = mongoose.model(
  "StudentProfile",
  studentProfileSchema
);

module.exports = StudentProfile;
