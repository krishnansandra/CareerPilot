
import API from "./api";

// Student applies for a job
export const applyForJob = async (jobId, applicationData, token) => {
  const response = await API.post(
    `/applications/${jobId}`,
    applicationData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// Student views their applications
export const getMyApplications = async (token) => {
  const response = await API.get("/applications/my-applications", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// Recruiter views applicants
export const getRecruiterApplicants = async (token) => {
  const response = await API.get("/recruiter/applicants", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// Recruiter updates application status
export const updateApplicationStatus = async (
  applicationId,
  status,
  token
) => {
  const response = await API.put(
    `/recruiter/applications/${applicationId}/status`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// Recruiter views applicant resume
export const viewApplicantResume = async (applicationId, token) => {
  const response = await API.get(
    `/recruiter/applications/${applicationId}/resume`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob",
    }
  );

  return response.data;
};

// Recruiter downloads applicant resume
export const downloadApplicantResume = async (
  applicationId,
  token
) => {
  const response = await API.get(
    `/recruiter/applications/${applicationId}/resume`,
    {
      params: { download: true },
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob",
    }
  );

  return response.data;
};

// Recruiter evaluates an applicant
export const evaluateApplicant = async (
  applicationId,
  evaluationData,
  token
) => {
  const response = await API.put(
    `/recruiter/applications/${applicationId}/evaluation`,
    evaluationData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const compareApplicantsWithAI = async (applicationIds, token) => {
  const response = await API.post(
    "/recruiter/applicants/compare",
    { applicationIds },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
