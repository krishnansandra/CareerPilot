
const dns = require("node:dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const studentProfileRoutes = require("./routes/studentProfileRoutes");
const recruiterProfileRoutes = require("./routes/recruiterProfileRoutes");
const jobRoutes = require("./routes/jobRoutes");
const studentJobRoutes = require("./routes/studentJobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const recruiterApplicationRoutes = require("./routes/recruiterApplicationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const skillRoadmapRoutes = require("./routes/skillRoadmapRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const recruiterInterviewRoutes = require("./routes/recruiterInterviewRoutes");



const app = express();

// Middleware MUST come before routes
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/student", studentProfileRoutes);
app.use("/api/recruiter", recruiterProfileRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/student/jobs", studentJobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/recruiter", recruiterApplicationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/notifications", notificationRoutes);
const resumeBuilderRoutes = require("./routes/resumeBuilderRoutes");
const studentInterviewRoutes = require("./routes/studentInterviewRoutes");

// Welcome route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to CareerPilot API",
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CareerPilot server is running successfully",
  });
});

app.use("/api/skill-roadmap", skillRoadmapRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/resume-builder", resumeBuilderRoutes);
app.use("/api/recruiter/interviews", recruiterInterviewRoutes);
app.use("/api/student/interviews", studentInterviewRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`CareerPilot server running on port ${PORT}`);
  });
};

startServer();
