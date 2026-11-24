
import API from "./api";

const getConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Create a job
export const createJob = async (jobData, token) => {
  const response = await API.post(
    "/jobs",
    jobData,
    getConfig(token)
  );

  return response.data;
};

// Get all jobs posted by recruiter
export const getRecruiterJobs = async (token) => {
  const response = await API.get(
    "/jobs/my-jobs",
    getConfig(token)
  );

  return response.data;
};

// Get individual job
export const getRecruiterJobById = async (jobId, token) => {
  const response = await API.get(
    `/jobs/${jobId}`,
    getConfig(token)
  );

  return response.data;
};

// Update job
export const updateJob = async (jobId, jobData, token) => {
  const response = await API.put(
    `/jobs/${jobId}`,
    jobData,
    getConfig(token)
  );

  return response.data;
};

// Delete job
export const deleteJob = async (jobId, token) => {
  const response = await API.delete(
    `/jobs/${jobId}`,
    getConfig(token)
  );

  return response.data;
};
