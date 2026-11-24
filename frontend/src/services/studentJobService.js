
import API from "./api";

export const getStudentJobs = async (filters = {}, token) => {
  const response = await API.get("/student/jobs", {
    params: filters,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};


export const getStudentJobById = async (jobId, token) => {
  const response = await API.get(`/student/jobs/${jobId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
