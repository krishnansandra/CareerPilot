
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, CalendarDays, Eye } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { getMyApplications } from "../services/applicationService";

function StudentApplications() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getMyApplications(token);
        setApplications(response.applications || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load applications."
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchApplications();
  }, [token]);

  const getStatusStyle = (status) => {
    const styles = {
      Applied: "bg-blue-50 text-blue-700",
      "Under Review": "bg-yellow-50 text-yellow-700",
      Shortlisted: "bg-green-50 text-green-700",
      Rejected: "bg-red-50 text-red-700",
      Hired: "bg-purple-50 text-purple-700",
    };

    return styles[status] || "bg-slate-100 text-slate-700";
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (loading) {
    return <div className="p-8 text-center">Loading applications...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          My Applications
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Track the progress of your job applications.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Applications</p>
          <h2 className="mt-2 text-3xl font-bold text-blue-700">
            {applications.length}
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Shortlisted</p>
          <h2 className="mt-2 text-3xl font-bold text-green-600">
            {applications.filter(
              (app) => app.status === "Shortlisted"
            ).length}
          </h2>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </p>
      )}

      {applications.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center">
          <Briefcase className="mx-auto text-slate-400" size={36} />
          <h2 className="mt-4 font-semibold text-slate-800">
            No applications yet
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Explore available jobs and submit your first application.
          </p>
          <button
            onClick={() => navigate("/student/jobs")}
            className="mt-5 rounded-lg bg-blue-700 px-5 py-2 text-sm text-white"
          >
            Explore Jobs
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div
              key={application._id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {application.job?.title || "Job no longer available"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-600">
                    {application.job?.companyName || "Company"}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Briefcase size={14} />
                      {application.job?.employmentType || "Not specified"}
                    </span>

                    <span className="flex items-center gap-1">
                      <CalendarDays size={14} />
                      Applied: {formatDate(application.appliedAt)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-3 sm:items-end">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(application.status)}`}
                  >
                    {application.status}
                  </span>

                  {application.job?._id && (
                    <button
                      onClick={() =>
                        navigate(`/student/jobs/${application.job._id}`)
                      }
                      className="flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900"
                    >
                      <Eye size={16} />
                      View Job
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentApplications;
