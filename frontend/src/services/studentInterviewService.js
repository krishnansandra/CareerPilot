
import API from "./api";

const getConfig = () => {
  const token = localStorage.getItem("careerpilot_token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Get interview invitations
export const getStudentInterviews = async () => {
  const response = await API.get(
    "/student/interviews",
    getConfig()
  );

  return response.data;
};

// Accept or decline an interview invitation
export const respondToInterview = async (interviewId, responseValue) => {
  const response = await API.put(
    `/student/interviews/${interviewId}/response`,
    { response: responseValue },
    getConfig()
  );

  return response.data;
};
