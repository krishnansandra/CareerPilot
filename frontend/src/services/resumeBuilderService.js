
import API from "./api";

const getConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Get the student's saved resume
export const getMyResume = async (token) => {
  const response = await API.get(
    "/resume-builder",
    getConfig(token)
  );

  return response.data;
};

// Save the resume
export const saveMyResume = async (resumeData, token) => {
  const response = await API.post(
    "/resume-builder",
    resumeData,
    getConfig(token)
  );

  return response.data;
};

// Update the existing resume
export const updateMyResume = async (resumeData, token) => {
  const response = await API.put(
    "/resume-builder",
    resumeData,
    getConfig(token)
  );

  return response.data;
};
