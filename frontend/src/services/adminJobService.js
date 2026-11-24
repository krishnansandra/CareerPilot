
import API from "./api";

const getConfig = () => {
  const token = localStorage.getItem("careerpilot_token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Get all jobs with optional search and status filters
export const getAllAdminJobs = async (filters = {}) => {
  const response = await API.get("/admin/jobs", {
    ...getConfig(),
    params: filters,
  });

  return response.data;
};

// Get a single job
export const getAdminJobById = async (jobId) => {
  const response = await API.get(
    `/admin/jobs/${jobId}`,
    getConfig()
  );

  return response.data;
};

// Close or reopen a job
export const updateAdminJobStatus = async (jobId, status) => {
  const response = await API.put(
    `/admin/jobs/${jobId}/status`,
    { status },
    getConfig()
  );

  return response.data;
};

// Delete a job
export const deleteAdminJob = async (jobId) => {
  const response = await API.delete(
    `/admin/jobs/${jobId}`,
    getConfig()
  );

  return response.data;
};

