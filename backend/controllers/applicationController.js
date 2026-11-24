const fs = require("fs");
const path = require("path");
const Application = require("../models/Application");
const Job = require("../models/Job");
const Notification = require("../models/Notification");
const StudentProfile = require("../models/StudentProfile");
const Resume = require("../models/Resume");
const { generateAIResponse } = require("../services/geminiService");

// Apply for a job
const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;

    if (!require("mongoose").isValidObjectId(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const job = await Job.findOne({
      _id: jobId,
      status: "Open",
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or no longer available",
      });
    }

    if (job.recruiter.toString() === req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You cannot apply to your own job",
      });
    }

    const existingApplication = await Application.findOne({
      student: req.user.id,
      job: jobId,
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    const application = await Application.create({
      student: req.user.id,
      job: job._id,
      recruiter: job.recruiter,
      coverLetter,
    });

    res.status(201).json({
      success: true,
      message: "Job application submitted successfully",
      application,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    res.status(500).json({
      success: false,
      message: "Unable to submit job application",
      error: error.message,
    });
  }
};

// Get student's applications
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      student: req.user.id,
    })
      .populate(
        "job",
        "title companyName location employmentType workplaceType"
      )
      .populate("recruiter", "name")
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      totalApplications: applications.length,
      applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch your applications",
      error: error.message,
    });
  }
};

// Get recruiter applicants with student profile and resume metadata
const getRecruiterApplicants = async (req, res) => {
  try {
    const applications = await Application.find({
      recruiter: req.user.id,
    })
      .populate("student", "name email")
      .populate(
        "job",
        "title companyName employmentType location"
      )
      .sort({ appliedAt: -1 });

    const studentIds = applications.map(
      (application) => application.student?._id
    ).filter(Boolean);

    // Fetch student profiles
    const profiles = await StudentProfile.find({
      user: { $in: studentIds },
    }).select(
      "user phone location professionalSummary skills careerInterests preferredJobRoles education experience projects portfolioUrl linkedinUrl githubUrl"
    );

    // Fetch resume metadata without exposing file paths or extracted text
    const resumes = await Resume.find({
      student: { $in: studentIds },
    }).select("student fileName fileSize uploadedAt");

    // Create lookup maps
    const profileMap = new Map(
      profiles.map((profile) => [
        profile.user.toString(),
        profile,
      ])
    );

    const resumeMap = new Map(
      resumes.map((resume) => [
        resume.student.toString(),
        resume,
      ])
    );

    // Attach profile and resume details to each application
    const enrichedApplications = applications.map((application) => {
      const applicationData = application.toObject();
      const studentId = application.student?._id?.toString();

      applicationData.studentProfile =
        profileMap.get(studentId) || null;

      applicationData.resume =
        resumeMap.get(studentId) || null;

      return applicationData;
    });

    res.status(200).json({
      success: true,
      totalApplicants: enrichedApplications.length,
      applications: enrichedApplications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch applicants",
      error: error.message,
    });
  }
};

// Update application status
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { applicationId } = req.params;

    const allowedStatuses = [
      "Under Review",
      "Shortlisted",
      "Rejected",
      "Hired",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status",
      });
    }

    const application = await Application.findOne({
      _id: applicationId,
      recruiter: req.user.id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const previousStatus = application.status;

    if (previousStatus === status) {
      return res.status(200).json({
        success: true,
        message: "Application already has this status",
        application,
      });
    }

    application.status = status;
    await application.save();

    const job = await Job.findById(application.job);
    const jobTitle = job ? job.title : "the job";

    const notificationDetails = {
      recipient: application.student,
      title: `Application ${status}`,
      message: `Your application for ${jobTitle} has been updated to ${status}.`,
      type: "Application",
      relatedJob: application.job,
    };

    if (status === "Shortlisted") {
      notificationDetails.type = "Shortlisted";
      notificationDetails.title =
        "Congratulations! You've been shortlisted";
    } else if (status === "Rejected") {
      notificationDetails.type = "Rejected";
      notificationDetails.title = "Application Status Updated";
    } else if (status === "Hired") {
      notificationDetails.type = "Hired";
      notificationDetails.title =
        "Congratulations! You've been hired";
    }

    await Notification.create(notificationDetails);

    res.status(200).json({
      success: true,
      message:
        "Application status updated and student notified successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to update application status",
      error: error.message,
    });
  }
};


const getApplicantResume = async (req, res) => {
  try {
    const { applicationId } = req.params;

    if (!require("mongoose").isValidObjectId(applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    // Confirm that this application belongs to the logged-in recruiter
    const application = await Application.findOne({
      _id: applicationId,
      recruiter: req.user.id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Find the applicant's uploaded resume
    const resume = await Resume.findOne({
      student: application.student,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Applicant has not uploaded a resume",
      });
    }

    // Restrict file access to the resumes upload directory
    const resumeDirectory = path.resolve(
      __dirname,
      "../uploads/resumes"
    );

    const filePath = path.resolve(resume.filePath);
    const relativePath = path.relative(resumeDirectory, filePath);

    if (
      !relativePath ||
      relativePath.startsWith("..") ||
      path.isAbsolute(relativePath)
    ) {
      return res.status(403).json({
        success: false,
        message: "Invalid resume file location",
      });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Resume file not found",
      });
    }

    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Cache-Control", "private, no-store");

    const download = req.query.download === "true";

    if (download) {
      return res.download(
        filePath,
        resume.fileName || "Applicant_Resume.pdf"
      );
    }

    res.setHeader(
      "Content-Disposition",
      'inline; filename="Applicant_Resume.pdf"'
    );

    return res.sendFile(filePath);
  } catch (error) {
    console.error("Applicant resume error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to access applicant resume",
    });
  }
};
// Recruiter evaluates an applicant
const evaluateApplicant = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { rating, strengths, weaknesses, notes } = req.body;

    // Validate rating
    if (rating === undefined || rating === null || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5.",
      });
    }

    // Find application belonging to this recruiter
    const application = await Application.findOne({
      _id: applicationId,
      recruiter: req.user.id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    // Save evaluation
    application.recruiterEvaluation = {
      rating,
      strengths: Array.isArray(strengths) ? strengths : [],
      weaknesses: Array.isArray(weaknesses) ? weaknesses : [],
      notes: notes || "",
      evaluatedAt: new Date(),
    };

    await application.save();

    res.status(200).json({
      success: true,
      message: "Applicant evaluation saved successfully.",
      evaluation: application.recruiterEvaluation,
    });
  } catch (error) {
    console.error("Evaluate Applicant Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




// AI-powered comparison of applicants for the same job
const compareApplicantsWithAI = async (req, res) => {
  try {
    const { applicationIds } = req.body;

    // Validate selected applicants
    if (
      !Array.isArray(applicationIds) ||
      applicationIds.length < 2 ||
      applicationIds.length > 3
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select between 2 and 3 applicants.",
      });
    }

    const mongoose = require("mongoose");

    if (
      applicationIds.some(
        (id) => !mongoose.isValidObjectId(id)
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more application IDs are invalid.",
      });
    }

    const uniqueIds = [...new Set(applicationIds.map(String))];

    if (uniqueIds.length !== applicationIds.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate applicants are not allowed.",
      });
    }

    // Fetch only applications belonging to this recruiter
    const applications = await Application.find({
      _id: { $in: uniqueIds },
      recruiter: req.user.id,
    })
      .populate("student", "name email")
      .populate("job");

    if (applications.length !== uniqueIds.length) {
      return res.status(404).json({
        success: false,
        message: "One or more applications were not found.",
      });
    }

    // All applicants must have applied for the same job
    const jobIds = [
      ...new Set(
        applications.map((application) =>
          application.job?._id?.toString()
        )
      ),
    ];

    if (jobIds.length !== 1 || !jobIds[0]) {
      return res.status(400).json({
        success: false,
        message: "Applicants must belong to the same job position.",
      });
    }

    const job = applications[0].job;

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job details not found.",
      });
    }

    const studentIds = applications.map(
      (application) => application.student?._id
    ).filter(Boolean);

    // Fetch student profiles
    const profiles = await StudentProfile.find({
      user: { $in: studentIds },
    }).lean();

    const profileMap = new Map(
      profiles.map((profile) => [
        profile.user.toString(),
        profile,
      ])
    );

    // Fetch uploaded resumes and their extracted text
    const resumes = await Resume.find({
      student: { $in: studentIds },
    })
      .select("student fileName extractedText")
      .lean();

    const resumeMap = new Map(
      resumes.map((resume) => [
        resume.student.toString(),
        resume,
      ])
    );

    // Prepare candidate information for Gemini
    const candidates = applications.map((application) => {
      const studentId = application.student?._id?.toString();

      const profile = profileMap.get(studentId);
      const resume = resumeMap.get(studentId);

      return {
        applicationId: application._id.toString(),
        name: application.student?.name || "Name unavailable",
        email: application.student?.email || "Email unavailable",

        applicationStatus: application.status,
        coverLetter: application.coverLetter || "Not provided",

        education: profile?.education || "Not provided",
        experience: profile?.experience || "Not provided",
        skills: profile?.skills || [],
        professionalSummary:
          profile?.professionalSummary || "Not provided",
        projects: profile?.projects || [],
        careerInterests: profile?.careerInterests || [],
        preferredJobRoles: profile?.preferredJobRoles || [],

        resumeFileName: resume?.fileName || "Not uploaded",

        resumeText: resume?.extractedText
          ? resume.extractedText.slice(0, 12000)
          : "Resume text unavailable",

        recruiterEvaluation: application.recruiterEvaluation
          ? {
              rating: application.recruiterEvaluation.rating,
              strengths: application.recruiterEvaluation.strengths,
              weaknesses: application.recruiterEvaluation.weaknesses,
              notes: application.recruiterEvaluation.notes,
            }
          : "Not evaluated by recruiter",
      };
    });

    // Prepare job requirements
    const jobDetails = {
      title: job.title,
      companyName: job.companyName,
      description: job.description,
      requiredSkills: job.requiredSkills || [],
      qualifications: job.qualifications || [],
      responsibilities: job.responsibilities || [],
      experienceLevel: job.experienceLevel,
      employmentType: job.employmentType,
      workplaceType: job.workplaceType,
      location: job.location,
    };

    const prompt = `
You are an expert recruitment assistance AI.

Compare the following applicants for the same job position.

JOB DETAILS:
${JSON.stringify(jobDetails, null, 2)}

APPLICANT DETAILS:
${JSON.stringify(candidates, null, 2)}

YOUR TASK:

Evaluate each applicant against the actual job requirements.

Consider:
1. Technical skill match.
2. Education relevance.
3. Relevant work experience.
4. Project relevance.
5. Resume and professional summary relevance.
6. Recruiter evaluation, if available.

IMPORTANT RULES:

- Use only the information supplied.
- Never invent qualifications, experience, skills, or achievements.
- Missing information must be identified as unavailable.
- Do not penalize a candidate simply because optional information is missing; explain the limitation.
- Do not use name, email, gender, age, location, or other personal characteristics to determine suitability.
- Do not treat recruiter ratings as objective facts. Consider them as supplementary human feedback.
- Scores must reflect relevance to the specified job, not general candidate quality.
- Recommendations must be explainable and advisory only.
- Do not make automatic hiring or rejection decisions.
- Return valid JSON only, without Markdown code fences.

RETURN THIS JSON STRUCTURE:

{
  "jobTitle": "Job title",
  "overallSummary": "Brief comparison summary",
  "candidateResults": [
    {
      "applicationId": "Exact application ID",
      "candidateName": "Candidate name",
      "matchPercentage": 0,
      "matchLevel": "Strong Match",
      "skillMatch": {
        "matchedSkills": [],
        "missingSkills": [],
        "additionalSkills": []
      },
      "educationAssessment": "Explanation",
      "experienceAssessment": "Explanation",
      "projectAssessment": "Explanation",
      "strengths": [],
      "improvementAreas": [],
      "recruiterEvaluationInsight": "Explanation or Not available",
      "reasoning": "Explain the match score"
    }
  ],
  "comparison": {
    "strongestTechnicalMatch": "Candidate name and reason",
    "strongestExperienceMatch": "Candidate name and reason",
    "keyDifferences": [],
    "informationGaps": []
  },
  "recommendation": {
    "suggestedCandidate": "Candidate name or No clear preference",
    "reason": "Explain the recommendation using job-related evidence",
    "otherCandidates": "Explain the other candidates' relevant strengths",
    "caution": "Mention limitations in the available information"
  }
}

Return exactly ${candidates.length} candidate results.

Every candidate result must use the exact applicationId supplied.
Scores must be whole numbers between 0 and 100.
The matchLevel must be one of:
Strong Match, Good Match, Partial Match, Low Match.

If the evidence does not support a clear preference, return
"No clear preference" instead of inventing a winner.
`;

    // Generate AI comparison
    const aiResponse = await generateAIResponse(prompt);

    if (!aiResponse) {
      return res.status(502).json({
        success: false,
        message: "AI returned an empty comparison.",
      });
    }

    // Parse Gemini JSON response
    let comparisonResult;

    try {
      const cleanedResponse = aiResponse
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      comparisonResult = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("AI comparison JSON parsing failed:", parseError);

      return res.status(502).json({
        success: false,
        message: "AI generated an invalid comparison. Please try again.",
      });
    }

    // Validate that Gemini returned a result for every selected applicant
    const returnedIds = (
      comparisonResult.candidateResults || []
    ).map((candidate) => candidate.applicationId);

    const hasAllCandidates =
      returnedIds.length === uniqueIds.length &&
      uniqueIds.every((id) => returnedIds.includes(id));

    if (!hasAllCandidates) {
      return res.status(502).json({
        success: false,
        message: "AI comparison did not include all selected applicants. Please try again.",
      });
    }

    // Validate and normalize scores
    comparisonResult.candidateResults =
      comparisonResult.candidateResults.map((candidate) => ({
        ...candidate,
        matchPercentage: Math.max(
          0,
          Math.min(100, Math.round(Number(candidate.matchPercentage) || 0))
        ),
      }));

    res.status(200).json({
      success: true,
      message: "AI applicant comparison generated successfully.",
      comparison: comparisonResult,
    });
  } catch (error) {
    console.error("AI Applicant Comparison Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to compare applicants using AI.",
      error: error.message,
    });
  }
};



module.exports = {
  applyForJob,
  getMyApplications,
  getRecruiterApplicants,
  updateApplicationStatus,
   evaluateApplicant,
  getApplicantResume,
  compareApplicantsWithAI,
};
