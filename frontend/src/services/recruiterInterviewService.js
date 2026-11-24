
import API from "./api";

const getConfig = () => {
  const token = localStorage.getItem("careerpilot_token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Schedule an interview
export const scheduleInterview = async (applicationId, data) => {
  const response = await API.post(
    `/recruiter/interviews/${applicationId}/schedule`,
    data,
    getConfig()
  );

  return response.data;
};

// Get recruiter's scheduled interviews
export const getRecruiterInterviews = async () => {
  const response = await API.get(
    "/recruiter/interviews/my-interviews",
    getConfig()
  );

  return response.data;
};

// Reschedule an interview
export const rescheduleInterview = async (interviewId, data) => {
  const response = await API.put(
    `/recruiter/interviews/${interviewId}/reschedule`,
    data,
    getConfig()
  );

  return response.data;
};

// Cancel an interview
export const cancelInterview = async (interviewId) => {
  const response = await API.put(
    `/recruiter/interviews/${interviewId}/cancel`,
    {},
    getConfig()
  );

  return response.data;
};

// Mark an interview as completed
export const completeInterview = async (interviewId) => {
  const response = await API.put(
    `/recruiter/interviews/${interviewId}/complete`,
    {},
    getConfig()
  );

  return response.data;
};
