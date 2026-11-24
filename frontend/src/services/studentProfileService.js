
import API from "./api";

const getConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Get student profile
export const getStudentProfile = async (token) => {
  const response = await API.get(
    "/student/profile",
    getConfig(token)
  );

  return response.data;
};

// Create student profile
export const createStudentProfile = async (profileData, token) => {
  const response = await API.post(
    "/student/profile",
    profileData,
    getConfig(token)
  );

  return response.data;
};

// Update student profile
export const updateStudentProfile = async (profileData, token) => {
  const response = await API.put(
    "/student/profile",
    profileData,
    getConfig(token)
  );

  return response.data;
};
