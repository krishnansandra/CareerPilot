
const InterviewSession = require("../models/InterviewSession");
const Resume = require("../models/Resume");
const StudentProfile = require("../models/StudentProfile");
const { generateAIResponse } = require("../services/geminiService");

// Generate AI interview questions
const generateInterview = async (req, res) => {
  try {
    const {
      targetRole,
      interviewType,
      difficulty,
    } = req.body;

    if (!targetRole || !targetRole.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a target job role.",
      });
    }

    const validTypes = [
      "Technical",
      "HR",
      "Behavioral",
      "Mixed",
    ];

    const validDifficulties = [
      "Beginner",
      "Intermediate",
      "Advanced",
    ];

    if (!validTypes.includes(interviewType)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid interview type.",
      });
    }

    const selectedDifficulty =
      difficulty || "Intermediate";

    if (!validDifficulties.includes(selectedDifficulty)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid difficulty level.",
      });
    }

    const [resume, profile] = await Promise.all([
      Resume.findOne({ student: req.user.id }),
      StudentProfile.findOne({ user: req.user.id }),
    ]);

    const resumeText = resume
      ? resume.extractedText
      : "Resume not available.";

    const studentSkills =
      profile?.skills?.length
        ? profile.skills.join(", ")
        : "Not specified.";

    const prompt = `
You are an experienced technical interviewer and career coach.

Generate exactly 10 interview questions for a student.

TARGET JOB ROLE:
${targetRole}

INTERVIEW TYPE:
${interviewType}

DIFFICULTY:
${selectedDifficulty}

STUDENT SKILLS:
${studentSkills}

STUDENT RESUME:
${resumeText}

Instructions:
1. Generate exactly 10 relevant interview questions.
2. Match questions to the target job role.
3. Consider the student's skills and experience.
4. Questions must match the selected interview type.
5. For Mixed interviews, include technical, HR and behavioral questions.
6. Use the selected difficulty level.
7. Avoid duplicate questions.
8. Do not provide answers.
9. Return only valid JSON.

Required JSON structure:

{
  "questions": [
    {
      "question": "Interview question 1"
    },
    {
      "question": "Interview question 2"
    }
  ]
}
`;

    const aiResponse = await generateAIResponse(prompt);

    const cleanedResponse = aiResponse
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const result = JSON.parse(cleanedResponse);

    if (
      !Array.isArray(result.questions) ||
      result.questions.length !== 10 ||
      result.questions.some(
        (item) =>
          typeof item.question !== "string" ||
          !item.question.trim()
      )
    ) {
      throw new Error(
        "AI returned an invalid interview question list."
      );
    }

    const interview = await InterviewSession.create({
      student: req.user.id,
      targetRole: targetRole.trim(),
      interviewType,
      difficulty: selectedDifficulty,
      questions: result.questions.map((item) => ({
        question: item.question.trim(),
      })),
    });

    return res.status(201).json({
      success: true,
      message: "Interview questions generated successfully.",
      interview,
    });

  } catch (error) {
    console.error("Generate interview error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message.includes("invalid interview")
          ? error.message
          : "Unable to generate interview questions. Please try again.",
    });
  }
};


const submitInterviewAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer } = req.body;

    if (!interviewId || questionIndex === undefined || !answer?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Interview ID, question index and answer are required.",
      });
    }

    if (
      !Number.isInteger(questionIndex) ||
      questionIndex < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid question index.",
      });
    }

    const interview = await InterviewSession.findOne({
      _id: interviewId,
      student: req.user.id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview session not found.",
      });
    }

    if (interview.status === "Completed") {
      return res.status(400).json({
        success: false,
        message: "This interview is already completed.",
      });
    }

    const question = interview.questions[questionIndex];

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Interview question not found.",
      });
    }

    const prompt = `
You are an experienced interview evaluator.

Evaluate the student's answer to the following interview question.

JOB ROLE: ${interview.targetRole}
INTERVIEW TYPE: ${interview.interviewType}
DIFFICULTY: ${interview.difficulty}

QUESTION:
${question.question}

STUDENT ANSWER:
${answer.trim()}

Evaluate based on correctness, relevance, clarity and completeness.

Return ONLY valid JSON in this structure:

{
  "score": 7,
  "feedback": "Your answer demonstrates a good understanding...",
  "strengths": ["Relevant explanation"],
  "improvements": ["Include a practical example"]
}

Rules:
- Score must be a number between 0 and 10.
- Be constructive and fair.
- Do not give a high score to an empty or irrelevant answer.
- Strengths and improvements must be arrays of strings.
`;

    const aiResponse = await generateAIResponse(prompt);

    const cleanedResponse = aiResponse
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const result = JSON.parse(cleanedResponse);

    if (
      typeof result.score !== "number" ||
      result.score < 0 ||
      result.score > 10 ||
      typeof result.feedback !== "string" ||
      !Array.isArray(result.strengths) ||
      !Array.isArray(result.improvements)
    ) {
      throw new Error("Invalid AI evaluation response.");
    }

    question.answer = answer.trim();
    question.score = result.score;
    question.feedback = result.feedback;
    question.strengths = result.strengths;
    question.improvements = result.improvements;
    question.answeredAt = new Date();

    
interview.completedQuestions = interview.questions.filter(
  (item) => item.answeredAt !== null
).length;

// Calculate the final interview result when all questions are answered
if (interview.completedQuestions === interview.questions.length) {
  const totalScore = interview.questions.reduce(
    (total, item) => total + item.score,
    0
  );

  interview.overallScore = Number(
    (totalScore / interview.questions.length).toFixed(2)
  );

  interview.status = "Completed";

  if (interview.overallScore >= 8) {
    interview.overallFeedback =
      "Excellent performance! You demonstrated strong knowledge and communication. Keep practising to maintain your confidence.";
  } else if (interview.overallScore >= 6) {
    interview.overallFeedback =
      "Good performance! You have a solid foundation, but some answers need more detail and practical examples.";
  } else if (interview.overallScore >= 4) {
    interview.overallFeedback =
      "Fair performance. Focus on strengthening your fundamentals and practising structured answers.";
  } else {
    interview.overallFeedback =
      "You need more preparation. Review the relevant concepts, practise answering questions, and try another mock interview.";
  }
}

await interview.save();


    return res.status(200).json({
      success: true,
      message: "Answer evaluated successfully.",
      evaluation: {
        question: question.question,
        answer: question.answer,
        score: question.score,
        feedback: question.feedback,
        strengths: question.strengths,
        improvements: question.improvements,
      },
      completedQuestions: interview.completedQuestions,
      totalQuestions: interview.questions.length,
      status: interview.status,
overallScore: interview.overallScore,
overallFeedback: interview.overallFeedback,
    });

  } catch (error) {
    console.error("Submit interview answer error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to evaluate your answer. Please try again.",
    });
  }
};



// Get all previous interview sessions
const getMyInterviewHistory = async (req, res) => {
  try {
    const interviews = await InterviewSession.find({
      student: req.user.id,
    })
      .select("-student")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      totalInterviews: interviews.length,
      interviews,
    });
  } catch (error) {
    console.error("Get interview history error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve interview history.",
    });
  }
};


// Get one interview by ID (for reviewing or resuming)
const getInterviewById = async (req, res) => {
  try {
    const { interviewId } = req.params;

    if (!require("mongoose").isValidObjectId(interviewId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview ID.",
      });
    }

    const interview = await InterviewSession.findOne({
      _id: interviewId,
      student: req.user.id,
    }).select("-student");

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview session not found.",
      });
    }

    return res.status(200).json({
      success: true,
      interview,
    });
  } catch (error) {
    console.error("Get interview details error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve interview details.",
    });
  }
};


module.exports = {
  generateInterview,submitInterviewAnswer,getMyInterviewHistory,getInterviewById
};

