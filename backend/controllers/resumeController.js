const path = require("path");
const Resume = require("../models/Resume");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const Job = require("../models/Job");
const ResumeAnalysis = require("../models/ResumeAnalysis");
// Upload and extract resume text
const uploadStudentResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF resume.",
      });
    }

    // Extract text from uploaded PDF
    const fileBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(fileBuffer);

    if (!pdfData.text || !pdfData.text.trim()) {
      fs.unlinkSync(req.file.path);

      return res.status(400).json({
        success: false,
        message: "Could not extract text. Please upload a readable PDF.",
      });
    }

    // Find the student's existing resume
    const existingResume = await Resume.findOne({
      student: req.user.id,
    });

    // Delete the previous file when replacing a resume
    if (existingResume && fs.existsSync(existingResume.filePath)) {
      fs.unlinkSync(existingResume.filePath);
    }

    const resume = await Resume.findOneAndUpdate(
      { student: req.user.id },
      {
        student: req.user.id,
        fileName: req.file.originalname,
        filePath: req.file.path,
        extractedText: pdfData.text,
        fileSize: req.file.size,
        uploadedAt: new Date(),
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Resume uploaded and text extracted successfully.",
      resume: {
        id: resume._id,
        fileName: resume.fileName,
        fileSize: resume.fileSize,
        uploadedAt: resume.uploadedAt,
        extractedText: resume.extractedText,
      },
    });
  } catch (error) {
    console.error("Resume upload error:", error);

    // Clean up the newly uploaded file if processing fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: "Unable to upload and process resume.",
      error: error.message,
    });
  }
};


const { generateAIResponse } = require("../services/geminiService");

// AI Resume Analysis

// AI Resume Analysis with Structured Scoring

const analyzeStudentResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      student: req.user.id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Please upload your resume first.",
      });
    }

    if (!resume.extractedText) {
      return res.status(400).json({
        success: false,
        message: "No resume text found. Please upload your resume again.",
      });
    }

    const prompt = `
You are an expert resume evaluator and career advisor.

Analyze the following resume and return ONLY valid JSON.

Resume:
${resume.extractedText}

Evaluate the resume using these categories:

1. Contact Information - maximum 10
2. Professional Summary - maximum 10
3. Technical Skills - maximum 20
4. Education - maximum 10
5. Projects and Experience - maximum 20
6. ATS Keywords and Relevance - maximum 15
7. Formatting and Readability - maximum 15

Return JSON in exactly this structure:

{
  "score": 0,
  "scoreBreakdown": [
    {
      "category": "contactInformation",
      "label": "Contact Information",
      "score": 0,
      "maxScore": 10,
      "feedback": ""
    }
  ],
  "summary": "",
  "strengths": [],
  "weaknesses": [],
  "technicalSkills": [],
  "softSkills": [],
  "missingSkills": [],
  "suggestions": [],
  "suitableJobRoles": []
}

The total score must be out of 100.
Keep feedback practical and relevant.
Do not invent qualifications or experience.
`;

    const aiResponse = await generateAIResponse(prompt);

    let analysis;

    try {
      const cleanedResponse = aiResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      analysis = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("AI JSON parsing error:", parseError);

      return res.status(500).json({
        success: false,
        message: "Unable to process AI analysis response.",
      });
    }

    // Save or update the latest analysis in MongoDB
    const savedAnalysis = await ResumeAnalysis.findOneAndUpdate(
      { student: req.user.id },
      {
        student: req.user.id,
        resume: resume._id,
        ...analysis,
        analyzedAt: new Date(),
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );
    // Delete previous AI analysis when a new resume is uploaded
await ResumeAnalysis.findOneAndDelete({
  student: req.user.id,
});

    return res.status(200).json({
      success: true,
      message: "Resume analyzed and saved successfully.",
      analysis: savedAnalysis,
    });
  } catch (error) {
    console.error("Resume analysis error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to analyze resume.",
    });
  }
};


// Download student's uploaded resume
const downloadStudentResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      student: req.user.id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "No resume found. Please upload your resume first.",
      });
    }

    const uploadDirectory = path.resolve(
      __dirname,
      "../uploads/resumes"
    );

    const filePath = path.resolve(resume.filePath);

    // Ensure the file belongs to the resume upload directory
    if (!filePath.startsWith(uploadDirectory + path.sep)) {
      return res.status(403).json({
        success: false,
        message: "Invalid resume file path.",
      });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Resume file not found on the server.",
      });
    }

    res.download(filePath, resume.fileName);
  } catch (error) {
    console.error("Resume download error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to download resume.",
    });
  }
};



const getRecommendedJobs = async (req, res) => {
  try {
    // Get student's saved resume
    const resume = await Resume.findOne({
      student: req.user.id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Please upload your resume first.",
      });
    }

    const resumeText = resume.extractedText || "";

    if (!resumeText.trim()) {
      return res.status(400).json({
        success: false,
        message: "No readable text found in your resume.",
      });
    }

    // Normalize text for more consistent skill matching
    const normalizeText = (text) =>
      text
        .toLowerCase()
        .replace(/[^a-z0-9+#]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const normalizedResume = ` ${normalizeText(resumeText)} `;

    // Get all currently open jobs
    const jobs = await Job.find({
      status: "Open",
    }).sort({ createdAt: -1 });

    // Generate detailed job recommendations
    const recommendations = jobs.map((job) => {
      const requiredSkills = [
        ...new Set(
          (job.requiredSkills || [])
            .filter((skill) => skill && skill.trim())
        ),
      ];

      // Identify matched skills
      const matchedSkills = requiredSkills.filter((skill) => {
        const normalizedSkill = normalizeText(skill);

        return normalizedSkill
          ? normalizedResume.includes(` ${normalizedSkill} `)
          : false;
      });

      // Identify missing skills
      const missingSkills = requiredSkills.filter(
        (skill) => !matchedSkills.includes(skill)
      );

      // Calculate match percentage
      const matchPercentage =
        requiredSkills.length > 0
          ? Math.round(
              (matchedSkills.length / requiredSkills.length) * 100
            )
          : 0;

      // Determine match level
      let matchLevel;

      if (matchPercentage >= 80) {
        matchLevel = "Excellent Match";
      } else if (matchPercentage >= 60) {
        matchLevel = "Good Match";
      } else if (matchPercentage >= 40) {
        matchLevel = "Moderate Match";
      } else {
        matchLevel = "Low Match";
      }

      // Generate explanation
      let matchExplanation;

      if (requiredSkills.length === 0) {
        matchExplanation =
          "This job does not have specified required skills, so a skill-based match cannot be calculated.";
      } else if (matchedSkills.length === 0) {
        matchExplanation =
          "Your resume does not currently show the required skills for this position. Review the missing skills before applying.";
      } else {
        matchExplanation =
          `Your resume matches ${matchedSkills.length} out of ${requiredSkills.length} required skills for this position. ` +
          (matchPercentage >= 60
            ? "Your existing skills make this a promising opportunity."
            : "Developing the missing skills could improve your suitability for this role.");
      }

      // Suggest skills to improve
      const improvementSuggestions = missingSkills.map(
        (skill) => `Consider learning or improving ${skill}.`
      );

      return {
        job,
        matchPercentage,
        matchLevel,
        matchedSkills,
        missingSkills,
        matchExplanation,
        improvementSuggestions,
      };
    });

    // Sort highest matching jobs first
    recommendations.sort(
      (a, b) => b.matchPercentage - a.matchPercentage
    );

    return res.status(200).json({
      success: true,
      totalRecommendations: recommendations.length,
      recommendations,
    });
  } catch (error) {
    console.error("Job recommendation error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to generate job recommendations.",
    });
  }
};


const getStudentResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      student: req.user.id,
    }).select("-extractedText");

    if (!resume) {
      return res.status(200).json({
        success: true,
        resume: null,
      });
    }

    return res.status(200).json({
      success: true,
      resume,
    });
  } catch (error) {
    console.error("Get resume error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch resume.",
    });
  }
};


const getSavedResumeAnalysis = async (req, res) => {
  try {
    const savedAnalysis = await ResumeAnalysis.findOne({
      student: req.user.id,
    }).populate("resume", "fileName uploadedAt");

    if (!savedAnalysis) {
      return res.status(404).json({
        success: false,
        message: "No saved resume analysis found.",
      });
    }

    return res.status(200).json({
      success: true,
      analysis: savedAnalysis,
    });
  } catch (error) {
    console.error("Get saved resume analysis error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve saved resume analysis.",
    });
  }
};



module.exports = {
  uploadStudentResume,
  analyzeStudentResume,
    downloadStudentResume,getRecommendedJobs,getStudentResume,  getSavedResumeAnalysis,
};


