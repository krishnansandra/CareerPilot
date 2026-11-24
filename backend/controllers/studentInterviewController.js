
const mongoose = require("mongoose");

const RecruiterInterview = require("../models/RecruiterInterview");
const Notification = require("../models/Notification");

// Get interview invitations for the logged-in student
const getStudentInterviews = async (req, res) => {
  try {
    const interviews = await RecruiterInterview.find({
      student: req.user.id,
    })
      .populate("recruiter", "name email")
      .populate("job", "title companyName")
      .sort({ interviewDate: 1 });

    res.status(200).json({
      success: true,
      totalInterviews: interviews.length,
      interviews,
    });
  } catch (error) {
    console.error("Get Student Interviews Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch interview invitations.",
    });
  }
};

// Student accepts or declines an interview
const respondToInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { response } = req.body;

    if (!mongoose.isValidObjectId(interviewId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview ID.",
      });
    }

    if (!["Accepted", "Declined"].includes(response)) {
      return res.status(400).json({
        success: false,
        message: "Response must be Accepted or Declined.",
      });
    }

    const interview = await RecruiterInterview.findOne({
      _id: interviewId,
      student: req.user.id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview invitation not found.",
      });
    }

    if (
      !["Scheduled", "Rescheduled"].includes(interview.status)
    ) {
      return res.status(400).json({
        success: false,
        message: "This interview invitation is no longer active.",
      });
    }

    if (interview.studentResponse !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "You have already responded to this invitation.",
      });
    }

    interview.studentResponse = response;
    await interview.save();

    // Notify recruiter about the student's response
    await Notification.create({
      recipient: interview.recruiter,
      title: `Interview ${response}`,
      message: `The student has ${response.toLowerCase()} the interview invitation.`,
      type: "Interview",
      relatedJob: interview.job,
    });

    const updatedInterview = await RecruiterInterview.findById(
      interview._id
    )
      .populate("recruiter", "name email")
      .populate("job", "title companyName");

    res.status(200).json({
      success: true,
      message: `Interview invitation ${response.toLowerCase()} successfully.`,
      interview: updatedInterview,
    });
  } catch (error) {
    console.error("Respond to Interview Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to submit your interview response.",
    });
  }
};

module.exports = {
  getStudentInterviews,
  respondToInterview,
};
