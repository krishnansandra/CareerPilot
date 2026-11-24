
const mongoose = require("mongoose");

const Application = require("../models/Application");
const RecruiterInterview = require("../models/RecruiterInterview");
const Notification = require("../models/Notification");

// Helper: validate and combine interview date and time
const getInterviewDateTime = (date, time) => {
  if (!date || !time) return null;

  const datePart = String(date).slice(0, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return null;
  }

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    return null;
  }

  const parsedDate = new Date(`${datePart}T${time}:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
};

// Helper: validate interview mode details
const validateInterviewMode = (mode, meetingLink, location) => {
  if (!["Online", "In-Person"].includes(mode)) {
    return "Please select a valid interview mode.";
  }

  if (mode === "Online" && !meetingLink?.trim()) {
    return "Please provide an online meeting link.";
  }

  if (mode === "In-Person" && !location?.trim()) {
    return "Please provide the interview location.";
  }

  return null;
};

// Schedule an interview
const scheduleInterview = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const {
      interviewType,
      interviewDate,
      interviewTime,
      interviewMode,
      meetingLink,
      location,
      instructions,
    } = req.body;

    if (!mongoose.isValidObjectId(applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID.",
      });
    }

    if (
      !["Technical", "HR", "Behavioral", "Mixed"].includes(interviewType)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid interview type.",
      });
    }

    const parsedDate = getInterviewDateTime(
      interviewDate,
      interviewTime
    );

    if (!parsedDate || parsedDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid future interview date and time.",
      });
    }

    const modeError = validateInterviewMode(
      interviewMode,
      meetingLink,
      location
    );

    if (modeError) {
      return res.status(400).json({
        success: false,
        message: modeError,
      });
    }

    const application = await Application.findOne({
      _id: applicationId,
      recruiter: req.user.id,
    }).populate("job", "title companyName");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    if (application.status === "Rejected") {
      return res.status(400).json({
        success: false,
        message: "You cannot schedule an interview for a rejected applicant.",
      });
    }

    const interview = await RecruiterInterview.create({
      application: application._id,
      student: application.student,
      recruiter: req.user.id,
      job: application.job._id,
      interviewType,
      interviewDate: parsedDate,
      interviewTime,
      interviewMode,
      meetingLink: interviewMode === "Online" ? meetingLink.trim() : "",
      location: interviewMode === "In-Person" ? location.trim() : "",
      instructions: instructions || "",
    });

    await Notification.create({
      recipient: application.student,
      title: "Interview Invitation",
      message: `You have been invited for a ${interviewType} interview for ${application.job.title} on ${parsedDate.toLocaleDateString("en-IN")}.`,
      type: "Interview",
      relatedJob: application.job._id,
    });

    const populatedInterview = await RecruiterInterview.findById(
      interview._id
    )
      .populate("student", "name email")
      .populate("recruiter", "name email")
      .populate("job", "title companyName");

    return res.status(201).json({
      success: true,
      message: "Interview scheduled successfully.",
      interview: populatedInterview,
    });
  } catch (error) {
    console.error("Schedule Interview Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to schedule interview.",
    });
  }
};

// Recruiter views scheduled interviews
const getRecruiterInterviews = async (req, res) => {
  try {
    const interviews = await RecruiterInterview.find({
      recruiter: req.user.id,
    })
      .populate("student", "name email")
      .populate("job", "title companyName")
      .sort({ interviewDate: 1 });

    res.status(200).json({
      success: true,
      totalInterviews: interviews.length,
      interviews,
    });
  } catch (error) {
    console.error("Get Recruiter Interviews Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch interviews.",
    });
  }
};

// Reschedule an interview
const rescheduleInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const {
      interviewType,
      interviewDate,
      interviewTime,
      interviewMode,
      meetingLink,
      location,
      instructions,
    } = req.body;

    if (!mongoose.isValidObjectId(interviewId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview ID.",
      });
    }

    const interview = await RecruiterInterview.findOne({
      _id: interviewId,
      recruiter: req.user.id,
    }).populate("job", "title companyName");

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found.",
      });
    }

    if (!["Scheduled", "Rescheduled"].includes(interview.status)) {
      return res.status(400).json({
        success: false,
        message: "Only active interviews can be rescheduled.",
      });
    }

    if (
      !["Technical", "HR", "Behavioral", "Mixed"].includes(interviewType)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid interview type.",
      });
    }

    const parsedDate = getInterviewDateTime(
      interviewDate,
      interviewTime
    );

    if (!parsedDate || parsedDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid future interview date and time.",
      });
    }

    const modeError = validateInterviewMode(
      interviewMode,
      meetingLink,
      location
    );

    if (modeError) {
      return res.status(400).json({
        success: false,
        message: modeError,
      });
    }

    interview.interviewType = interviewType;
    interview.interviewDate = parsedDate;
    interview.interviewTime = interviewTime;
    interview.interviewMode = interviewMode;
    interview.meetingLink =
      interviewMode === "Online" ? meetingLink.trim() : "";
    interview.location =
      interviewMode === "In-Person" ? location.trim() : "";
    interview.instructions = instructions || "";

    interview.status = "Rescheduled";
    interview.studentResponse = "Pending";

    await interview.save();

    await Notification.create({
      recipient: interview.student,
      title: "Interview Rescheduled",
      message: `Your interview for ${interview.job?.title || "the job position"} has been rescheduled to ${parsedDate.toLocaleDateString("en-IN")} at ${interviewTime}. Please review the updated invitation and respond again.`,
      type: "Interview",
      relatedJob: interview.job?._id || null,
    });

    const updatedInterview = await RecruiterInterview.findById(
      interview._id
    )
      .populate("student", "name email")
      .populate("job", "title companyName");

    res.status(200).json({
      success: true,
      message: "Interview rescheduled successfully.",
      interview: updatedInterview,
    });
  } catch (error) {
    console.error("Reschedule Interview Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to reschedule interview.",
    });
  }
};

// Cancel an interview
const cancelInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;

    if (!mongoose.isValidObjectId(interviewId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview ID.",
      });
    }

    const interview = await RecruiterInterview.findOne({
      _id: interviewId,
      recruiter: req.user.id,
    }).populate("job", "title companyName");

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found.",
      });
    }

    if (!["Scheduled", "Rescheduled"].includes(interview.status)) {
      return res.status(400).json({
        success: false,
        message: "This interview cannot be cancelled.",
      });
    }

    interview.status = "Cancelled";
    await interview.save();

    await Notification.create({
      recipient: interview.student,
      title: "Interview Cancelled",
      message: `Your interview for ${interview.job?.title || "the job position"} has been cancelled by the recruiter.`,
      type: "Interview",
      relatedJob: interview.job?._id || null,
    });

    res.status(200).json({
      success: true,
      message: "Interview cancelled successfully.",
      interview,
    });
  } catch (error) {
    console.error("Cancel Interview Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to cancel interview.",
    });
  }
};

// Mark an interview as completed
const completeInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;

    if (!mongoose.isValidObjectId(interviewId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview ID.",
      });
    }

    const interview = await RecruiterInterview.findOne({
      _id: interviewId,
      recruiter: req.user.id,
    }).populate("job", "title companyName");

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found.",
      });
    }

    if (!["Scheduled", "Rescheduled"].includes(interview.status)) {
      return res.status(400).json({
        success: false,
        message: "This interview cannot be marked as completed.",
      });
    }

    if (interview.studentResponse !== "Accepted") {
      return res.status(400).json({
        success: false,
        message: "The student must accept the invitation before completing the interview.",
      });
    }

    if (interview.interviewDate > new Date()) {
      return res.status(400).json({
        success: false,
        message: "You can mark this interview as completed only after its scheduled date and time.",
      });
    }

    interview.status = "Completed";
    await interview.save();

    await Notification.create({
      recipient: interview.student,
      title: "Interview Completed",
      message: `Your interview for ${interview.job?.title || "the job position"} has been marked as completed.`,
      type: "Interview",
      relatedJob: interview.job?._id || null,
    });

    res.status(200).json({
      success: true,
      message: "Interview marked as completed.",
      interview,
    });
  } catch (error) {
    console.error("Complete Interview Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to complete interview.",
    });
  }
};

module.exports = {
  scheduleInterview,
  getRecruiterInterviews,
  rescheduleInterview,
  cancelInterview,
  completeInterview,
};
