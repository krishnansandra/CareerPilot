
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getRecruiterJobs,
  deleteJob,
} from "../services/jobService";
import {
  BriefcaseBusiness,
  Plus,
  MapPin,
  Clock,
  Pencil,
  Trash2,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

function RecruiterJobs() {
  const { token } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getRecruiterJobs(token);
      setJobs(response.jobs || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your job postings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadJobs();
  }, [token]);

  const handleDelete = async (jobId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job posting?"
    );

    if (!confirmed) return;

    try {
      await deleteJob(jobId, token);

      setJobs((previousJobs) =>
        previousJobs.filter((job) => job._id !== jobId)
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete this job."
      );
    }
  };

  const statusStyle = (status) => {
    if (status === "Open") {
      return "bg-green-50 text-green-700";
    }

    if (status === "Closed") {
      return "bg-red-50 text-red-700";
    }

    return "bg-amber-50 text-amber-700";
  };

  return (
    <div className="mx-auto max-w-6xl space-y-7">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Recruiter Workspace
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Job Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage your job postings and discover potential candidates.
          </p>
        </div>

        <button
         
           onClick={() => navigate("/recruiter/jobs/new")}

        
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          <Plus size={18} />
          Post a New Job
        </button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Total Jobs
            </p>
            <BriefcaseBusiness className="text-blue-600" size={21} />
          </div>

          <h2 className="mt-3 text-3xl font-bold text-slate-900">
            {jobs.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Active Jobs
          </p>

          <h2 className="mt-3 text-3xl font-bold text-green-600">
            {jobs.filter((job) => job.status === "Open").length}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Closed Jobs
          </p>

          <h2 className="mt-3 text-3xl font-bold text-red-500">
            {jobs.filter((job) => job.status === "Closed").length}
          </h2>
        </div>
      </div>

      {/* Job Listings */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7">

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Your Job Postings
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review and manage your published opportunities.
            </p>
          </div>

          <button
            onClick={loadJobs}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
            title="Refresh jobs"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <LoaderCircle
              className="animate-spin text-blue-600"
              size={30}
            />
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-16 text-center">
            <BriefcaseBusiness
              size={45}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-semibold text-slate-800">
              No job postings yet
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Start by creating your first job opportunity.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="rounded-xl border border-slate-200 p-5 transition hover:border-blue-200 hover:shadow-sm"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">

                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                      <BriefcaseBusiness size={23} />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900">
                        {job.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {job.companyName}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {job.location || "Location not specified"}
                        </span>

                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {job.employmentType}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(job.status)}`}
                    >
                      {job.status}
                    </span>

                    <button
                      
                         onClick={() => navigate(`/recruiter/jobs/${job._id}/edit`)}
                      
                      className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                      title="Edit job"
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      onClick={() => handleDelete(job._id)}
                      className="rounded-lg border border-slate-200 p-2 text-red-500 hover:bg-red-50"
                      title="Delete job"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(job.requiredSkills || []).map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-lg bg-slate-100 px-3 py-1 text-xs text-slate-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RecruiterJobs;
