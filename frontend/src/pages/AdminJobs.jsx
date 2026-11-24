
import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  Search,
  RefreshCw,
  MapPin,
  Building2,
  Eye,
  X,
  Trash2,
  Lock,
  Unlock,
} from "lucide-react";

import DashboardLayout from "../layouts/DashboardLayout";
import {
  getAllAdminJobs,
  getAdminJobById,
  updateAdminJobStatus,
  deleteAdminJob,
} from "../services/adminJobService";

function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const filters = {};

      if (search.trim()) filters.search = search.trim();
      if (statusFilter !== "all") filters.status = statusFilter;

      const data = await getAllAdminJobs(filters);
      setJobs(data.jobs || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load job postings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [search, statusFilter]);

  const handleStatusChange = async (jobId, status) => {
    try {
      setUpdatingId(jobId);
      setError("");

      const data = await updateAdminJobStatus(jobId, status);

      setJobs((previous) =>
        previous.map((job) =>
          job._id === jobId
            ? { ...job, status: data.job.status }
            : job
        )
      );

      if (selectedJob?._id === jobId) {
        setSelectedJob(data.job);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update job status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteJob = async (job) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${job.title}"?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(job._id);
      setError("");

      await deleteAdminJob(job._id);

      setJobs((previous) =>
        previous.filter((item) => item._id !== job._id)
      );

      if (selectedJob?._id === job._id) {
        setSelectedJob(null);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete job."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleViewDetails = async (jobId) => {
    try {
      setDetailsLoading(true);
      setError("");

      const data = await getAdminJobById(jobId);
      setSelectedJob(data.job);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load job details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    if (status === "Open") return "bg-green-50 text-green-700";
    if (status === "Closed") return "bg-red-50 text-red-700";
    return "bg-amber-50 text-amber-700";
  };

  const formatSalary = (salary) => {
    if (!salary?.min && !salary?.max) return "Not disclosed";

    const currency = salary.currency || "INR";

    return `${currency} ${salary.min?.toLocaleString() || "—"} - ${
      salary.max?.toLocaleString() || "—"
    }`;
  };

  const openCount = jobs.filter((job) => job.status === "Open").length;
  const closedCount = jobs.filter((job) => job.status === "Closed").length;
  const draftCount = jobs.filter((job) => job.status === "Draft").length;

  return (
    <DashboardLayout
      title="Job Management"
      subtitle="Review and moderate all recruiter job postings"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#111C35]">
            All Job Postings
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Monitor and manage jobs posted by recruiters.
          </p>
        </div>

        <button
          onClick={fetchJobs}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {[
          {
            label: "Total Jobs",
            value: jobs.length,
            icon: BriefcaseBusiness,
            color: "text-violet-600",
          },
          {
            label: "Open Jobs",
            value: openCount,
            icon: Unlock,
            color: "text-green-600",
          },
          {
            label: "Closed Jobs",
            value: closedCount,
            icon: Lock,
            color: "text-red-600",
          },
          {
            label: "Draft Jobs",
            value: draftCount,
            icon: BriefcaseBusiness,
            color: "text-amber-600",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="bg-white border border-slate-200 rounded-2xl p-5"
            >
              <Icon className={item.color} size={24} />
              <p className="text-sm text-slate-500 mt-3">{item.label}</p>
              <h3 className="text-2xl font-bold text-[#111C35] mt-1">
                {loading ? "..." : item.value}
              </h3>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title, company or location..."
              className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-xl bg-red-50 text-red-700 p-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl p-10 text-center text-slate-500">
          Loading job postings...
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <BriefcaseBusiness
            size={36}
            className="mx-auto text-slate-400"
          />
          <h3 className="font-bold text-[#111C35] mt-4">
            No jobs found
          </h3>
          <p className="text-sm text-slate-500 mt-2">
            Try changing your search or status filter.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4">Job</th>
                  <th className="px-6 py-4">Recruiter</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Posted</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-[#111C35]">
                        {job.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {job.companyName}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-700">
                        {job.recruiter?.name || "—"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {job.recruiter?.email || ""}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      {job.location || "Not specified"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full ${getStatusStyle(job.status)}`}
                      >
                        {job.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      {job.createdAt
                        ? new Date(job.createdAt).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(job._id)}
                          title="View details"
                          className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"
                        >
                          <Eye size={16} />
                        </button>

                        {job.status !== "Draft" && (
                          <button
                            onClick={() =>
                              handleStatusChange(
                                job._id,
                                job.status === "Open" ? "Closed" : "Open"
                              )
                            }
                            disabled={updatingId === job._id}
                            title={
                              job.status === "Open" ? "Close job" : "Reopen job"
                            }
                            className="p-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                          >
                            {job.status === "Open" ? (
                              <Lock size={16} />
                            ) : (
                              <Unlock size={16} />
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteJob(job)}
                          disabled={updatingId === job._id}
                          title="Delete job"
                          className="p-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {detailsLoading && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 text-slate-600">
            Loading job details...
          </div>
        </div>
      )}

      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#111C35]">
                  Job Details
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Review the complete job posting.
                </p>
              </div>

              <button
                onClick={() => setSelectedJob(null)}
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <h4 className="text-xl font-bold text-[#111C35]">
                  {selectedJob.title}
                </h4>
                <p className="text-slate-500 mt-1">
                  {selectedJob.companyName}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
                  {selectedJob.employmentType}
                </span>
                <span className="bg-violet-50 text-violet-700 px-3 py-1.5 rounded-full">
                  {selectedJob.workplaceType}
                </span>
                <span className={`px-3 py-1.5 rounded-full ${getStatusStyle(selectedJob.status)}`}>
                  {selectedJob.status}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin size={17} />
                  {selectedJob.location || "Not specified"}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Building2 size={17} />
                  {selectedJob.recruiter?.name || "Recruiter not available"}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Salary
                </p>
                <p className="text-sm text-slate-700 mt-2">
                  {formatSalary(selectedJob.salary)}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Job Description
                </p>
                <p className="text-sm text-slate-600 mt-2 whitespace-pre-line">
                  {selectedJob.description || "No description provided."}
                </p>
              </div>

              {[
                ["Required Skills", selectedJob.requiredSkills],
                ["Responsibilities", selectedJob.responsibilities],
                ["Qualifications", selectedJob.qualifications],
              ].map(([heading, items]) => (
                <div key={heading}>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    {heading}
                  </p>
                  {items?.length ? (
                    <ul className="mt-2 space-y-1 list-disc list-inside text-sm text-slate-600">
                      {items.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500 mt-2">
                      Not provided
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default AdminJobs;
