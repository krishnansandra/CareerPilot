
import API from "./api";

const getConfig = () => {
  const token = localStorage.getItem("careerpilot_token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const generateInterview = async (data) => {
  const response = await API.post(
    "/interview/generate",
    data,
    getConfig()
  );

  return response.data;
};

export const submitInterviewAnswer = async (data) => {
  const response = await API.post(
    "/interview/answer",
    data,
    getConfig()
  );

  return response.data;
};

export const getInterviewHistory = async () => {
  const response = await API.get(
    "/interview/history",
    getConfig()
  );

  return response.data;
};

export const getInterviewById = async (interviewId) => {
  const response = await API.get(
    `/interview/${interviewId}`,
    getConfig()
  );

  return response.data;
};
