
import API from "./api";

const getConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Get all recruiter profiles
export const getAllRecruiters = async (token) => {
  const response = await API.get(
    "/admin/recruiters",
    getConfig(token)
  );

  return response.data;
};

// Approve or reject a recruiter
export const updateRecruiterVerification = async (
  recruiterId,
  status,
  token
) => {
  const response = await API.put(
    `/admin/recruiters/${recruiterId}/verification`,
    { status },
    getConfig(token)
  );

  return response.data;
};


// Get Admin Dashboard Statistics
export const getAdminDashboardStats = async (token) => {
  const response = await API.get(
    "/admin/dashboard-stats",
    getConfig(token)
  );

  return response.data;
};

// Get all registered users
export const getAllUsers = async (token) => {
  const response = await API.get(
    "/admin/users",
    getConfig(token)
  );

  return response.data;
};

// Activate or deactivate a user account
export const updateUserStatus = async (userId, isActive, token) => {
  const response = await API.put(
    `/admin/users/${userId}/status`,
    { isActive },
    getConfig(token)
  );

  return response.data;
};