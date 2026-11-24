
import API from "./api";

export const uploadResume = async (file, token) => {
  const formData = new FormData();

  formData.append("resume", file, file.name);

  const response = await API.post("/resume/upload", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const analyzeResume = async (token) => {
  const response = await API.post(
    "/resume/analyze",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// Download student's uploaded resume
export const downloadResume = async (token) => {
  const response = await API.get("/resume/download", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: "blob",
  });

  return response.data;
};

export const getRecommendedJobs = async (token) => {
  const response = await API.get("/resume/recommendations", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};


export const getMyResume = async (token) => {
  const response = await API.get("/resume/my-resume", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};


export const getSavedResumeAnalysis = async (token) => {
  const response = await API.get("/resume/saved-analysis", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

