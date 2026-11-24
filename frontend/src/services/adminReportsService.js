
import API from "./api";

// Get Admin Reports
export const getAdminReports = async () => {
  const token = localStorage.getItem("careerpilot_token");

  const response = await API.get("/admin/reports", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
