
import API from "./api";

// Generate a new skill roadmap
export const generateSkillRoadmap = async (targetRole, token) => {
  const response = await API.post(
    "/skill-roadmap/generate",
    { targetRole },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// Get all saved skill roadmaps
export const getMySkillRoadmaps = async (token) => {
  const response = await API.get(
    "/skill-roadmap/my-roadmaps",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};


// Update weekly learning progress
export const updateWeeklyProgress = async (
  roadmapId,
  week,
  isCompleted,
  token
) => {
  const response = await API.put(
    `/skill-roadmap/${roadmapId}/week/${week}`,
    { isCompleted },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};


// Confirm a learned skill and add it to the student profile
export const addAchievedSkillToProfile = async (
  roadmapId,
  skill,
  token
) => {
  const response = await API.post(
    `/skill-roadmap/${roadmapId}/achieved-skills`,
    { skill },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
