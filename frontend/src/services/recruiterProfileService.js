
import API from "./api";

const getConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Get recruiter profile
export const getRecruiterProfile = async (token) => {
  const response = await API.get(
    "/recruiter/profile",
    getConfig(token)
  );

  return response.data;
};

// Create recruiter profile
export const createRecruiterProfile = async (profileData, token) => {
  const response = await API.post(
    "/recruiter/profile",
    profileData,
    getConfig(token)
  );

  return response.data;
};

// Update recruiter profile
export const updateRecruiterProfile = async (profileData, token) => {
  const response = await API.put(
    "/recruiter/profile",
    profileData,
    getConfig(token)
  );

  return response.data;
};
