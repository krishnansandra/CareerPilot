
const StudentProfile = require("../models/StudentProfile");
const SkillRoadmap = require("../models/SkillRoadmap");
const Resume = require("../models/Resume");
const { generateAIResponse } = require("../services/geminiService");

// Generate a learning roadmap
const generateSkillRoadmap = async (req, res) => {
  try {
    const { targetRole } = req.body;

    if (!targetRole || !targetRole.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a target job role.",
      });
    }

    const resume = await Resume.findOne({
      student: req.user.id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Please upload your resume first.",
      });
    }

    
const prompt = `
You are an expert career mentor and technical learning advisor.

Analyze the student's resume and create a personalized learning roadmap based on their existing skills and skill gaps.

TARGET JOB ROLE:
${targetRole}

STUDENT RESUME:
${resume.extractedText}

YOUR TASK:

1. Identify the student's existing skills from the resume.
2. Identify missing skills required for the target job role.
3. Estimate the learning duration based on the complexity and number of missing skills.
4. Create a personalized roadmap containing 2 to 12 weekly modules.
5. Do NOT generate exactly four weeks for every student.
6. Small skill gaps may require 2-4 weeks.
7. Moderate skill gaps may require 5-8 weeks.
8. Large skill gaps may require 9-12 weeks.
9. Every weekly module MUST contain its own skills array.
10. Each weekly skills array MUST contain 2 to 5 specific skills.
11. Skills must relate to that week's topics and practical tasks.
12. Arrange modules from beginner to advanced.
13. Include practical tasks and measurable learning outcomes.
14. Avoid unnecessary repetition.
15. Do not invent qualifications or experience.

Return ONLY valid JSON.
Do not include Markdown code fences or explanations.

Use this structure:

{
  "currentSkills": ["JavaScript", "HTML", "CSS"],
  "missingSkills": ["React.js", "Redux", "API Integration"],
  "skillGaps": [
    {
      "skill": "React.js",
      "importance": "High"
    }
  ],
  "overallDuration": "6 Weeks",
  "roadmap": [
    {
      "week": 1,
      "title": "Module title",
      "topics": ["Topic 1", "Topic 2"],
      "tasks": ["Practical task 1", "Practical task 2"],
      "skills": ["Skill 1", "Skill 2"],
      "learningOutcome": "Expected learning outcome"
    }
  ]
}

IMPORTANT:
- Generate between 2 and 12 weekly modules.
- The roadmap array must contain every weekly module.
- Week numbers must be sequential, starting from 1.
- Every week must have a non-empty skills array.
- The overallDuration must match the actual number of generated weeks.
- Select the duration based on the student's actual skill gaps.
- Do not automatically choose four weeks.
`;


    const aiResponse = await generateAIResponse(prompt);

    const cleanedResponse = aiResponse
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const result = JSON.parse(cleanedResponse);

    // Validate the main roadmap structure
    if (
  !Array.isArray(result.currentSkills) ||
  !Array.isArray(result.missingSkills) ||
  !Array.isArray(result.skillGaps) ||
  !Array.isArray(result.roadmap) ||
  result.roadmap.length < 2 ||
  result.roadmap.length > 12
) {
  throw new Error("Invalid roadmap structure returned by AI.");
}

    // Validate and normalize every weekly module
    result.roadmap.forEach((week, index) => {
      if (
        !Array.isArray(week.skills) ||
        week.skills.length === 0
      ) {
        throw new Error(
          `Week ${index + 1} does not contain any skills.`
        );
      }

      if (
        !Array.isArray(week.topics) ||
        !Array.isArray(week.tasks)
      ) {
        throw new Error(
          `Week ${index + 1} has an invalid learning structure.`
        );
      }

      week.skills = week.skills
        .filter(
          (skill) =>
            typeof skill === "string" && skill.trim()
        )
        .map((skill) => skill.trim());

      if (week.skills.length === 0) {
        throw new Error(
          `Week ${index + 1} has no valid skills.`
        );
      }
    });

    // Save the generated roadmap
    const roadmap = await SkillRoadmap.create({
      student: req.user.id,
      targetRole: targetRole.trim(),
      currentSkills: result.currentSkills,
      missingSkills: result.missingSkills,
      skillGaps: result.skillGaps,
      overallDuration: result.overallDuration || "4 Weeks",
      roadmap: result.roadmap,
    });

    // Verify that weekly skills were saved
    console.log(
      "SAVED WEEKLY SKILLS:",
      roadmap.roadmap.map((week) => ({
        week: week.week,
        skills: week.skills,
      }))
    );

    return res.status(201).json({
      success: true,
      message: "Skill roadmap generated successfully.",
      roadmap,
    });

  } catch (error) {
    console.error("Skill roadmap generation error:", error);

    return res.status(500).json({
      success: false,
      message: error.message.includes("Week")
        ? error.message
        : "Unable to generate skill roadmap. Please try again.",
    });
  }
};


// Get student's saved roadmaps
const getMySkillRoadmaps = async (req, res) => {
  try {
    const roadmaps = await SkillRoadmap.find({
      student: req.user.id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalRoadmaps: roadmaps.length,
      roadmaps,
    });

  } catch (error) {
    console.error("Get skill roadmaps error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch skill roadmaps.",
    });
  }
};


// Update weekly progress and add skills to student profile
const updateWeeklyProgress = async (req, res) => {
  try {
    const { roadmapId, week } = req.params;
    const { isCompleted } = req.body;

    if (typeof isCompleted !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid completion status.",
      });
    }

    const roadmap = await SkillRoadmap.findOne({
      _id: roadmapId,
      student: req.user.id,
    });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: "Learning roadmap not found.",
      });
    }

    const selectedWeek = roadmap.roadmap.find(
      (item) => item.week === Number(week)
    );

    if (!selectedWeek) {
      return res.status(404).json({
        success: false,
        message: "Learning module not found.",
      });
    }

    // Add skills to profile when the module is completed
    if (isCompleted) {
      const profile = await StudentProfile.findOne({
        user: req.user.id,
      });

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "Please complete your student profile first.",
        });
      }

      const weeklySkills = selectedWeek.skills || [];

      weeklySkills.forEach((skill) => {
        if (typeof skill !== "string" || !skill.trim()) {
          return;
        }

        const alreadyExists = profile.skills.some(
          (item) =>
            item.trim().toLowerCase() === skill.trim().toLowerCase()
        );

        if (!alreadyExists) {
          profile.skills.push(skill.trim());
        }
      });

      await profile.save();
    }

    selectedWeek.isCompleted = isCompleted;
    selectedWeek.completedAt = isCompleted ? new Date() : null;

    const completedWeeks = roadmap.roadmap.filter(
      (item) => item.isCompleted
    ).length;

    roadmap.status =
      completedWeeks === roadmap.roadmap.length
        ? "Completed"
        : completedWeeks > 0
        ? "In Progress"
        : "Not Started";

    await roadmap.save();

    return res.status(200).json({
      success: true,
      message: isCompleted
        ? "Module completed and skills added to your profile."
        : "Module marked as incomplete.",
      roadmap,
    });

  } catch (error) {
    console.error("Update weekly progress error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update learning progress.",
    });
  }
};


// Legacy function: manually confirm an achieved skill
const addAchievedSkillToProfile = async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const { skill } = req.body;

    if (!skill || !skill.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid skill.",
      });
    }

    const roadmap = await SkillRoadmap.findOne({
      _id: roadmapId,
      student: req.user.id,
    });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: "Learning roadmap not found.",
      });
    }

    const normalizedSkill = skill.trim().toLowerCase();

    const skillGap = roadmap.skillGaps.find(
      (item) =>
        item.skill.trim().toLowerCase() === normalizedSkill
    );

    if (!skillGap) {
      return res.status(400).json({
        success: false,
        message: "This skill is not part of your learning roadmap.",
      });
    }

    const alreadyAchieved = roadmap.achievedSkills.some(
      (item) =>
        item.skill.toLowerCase() === normalizedSkill
    );

    if (alreadyAchieved) {
      return res.status(400).json({
        success: false,
        message: "You have already confirmed this skill.",
      });
    }

    const profile = await StudentProfile.findOne({
      user: req.user.id,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Please complete your student profile first.",
      });
    }

    const alreadyInProfile = profile.skills.some(
      (item) =>
        item.trim().toLowerCase() === normalizedSkill
    );

    if (!alreadyInProfile) {
      profile.skills.push(skill.trim());
      await profile.save();
    }

    roadmap.achievedSkills.push({
      skill: skillGap.skill,
      completedAt: new Date(),
      addedToProfile: true,
    });

    await roadmap.save();

    return res.status(200).json({
      success: true,
      message: "Skill confirmed and added to your profile successfully.",
      achievedSkills: roadmap.achievedSkills,
      profileSkills: profile.skills,
    });

  } catch (error) {
    console.error("Add achieved skill error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update your profile skill.",
    });
  }
};


module.exports = {
  generateSkillRoadmap,
  getMySkillRoadmaps,
  updateWeeklyProgress,
  addAchievedSkillToProfile,
};
