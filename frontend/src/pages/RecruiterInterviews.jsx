
import { useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  Clock,
  Search,
  RefreshCw,
  Video,
  MapPin,
  UserRound,
  BriefcaseBusiness,
  CheckCircle,
  XCircle,
  Edit,
  Loader2,
  AlertCircle,
  Users,
  Eye,
  X,
} from "lucide-react";

import {
  getRecruiterInterviews,
  rescheduleInterview,
  cancelInterview,
  completeInterview,
} from "../services/recruiterInterviewService";

const RecruiterInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [responseFilter, setResponseFilter] = useState("All");

  const [selectedInterview, setSelectedInterview] = useState(null);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);

  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);

  const [formData, setFormData] = useState({
    interviewType: "Technical",
    interviewDate: "",
    interviewTime: "",
    interviewMode: "Online",
    meetingLink: "",
    location: "",
    instructions: "",
  });

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getRecruiterInterviews();
      setInterviews(result.interviews || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load scheduled interviews."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const filteredInterviews = useMemo(() => {
    return interviews.filter((interview) => {
      const studentName =
        interview.student?.name?.toLowerCase() || "";

      const jobTitle =
        interview.job?.title?.toLowerCase() || "";

      const companyName =
        interview.job?.companyName?.toLowerCase() || "";

      const searchText = search.toLowerCase();

      const matchesSearch =
        studentName.includes(searchText) ||
        jobTitle.includes(searchText) ||
        companyName.includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        interview.status === statusFilter;

      const matchesResponse =
        responseFilter === "All" ||
        interview.studentResponse === responseFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesResponse
      );
    });
  }, [interviews, search, statusFilter, responseFilter]);

  const stats = {
    total: interviews.length,
    upcoming: interviews.filter(
      (item) =>
        ["Scheduled", "Rescheduled"].includes(item.status) &&
        new Date(item.interviewDate) > new Date()
    ).length,
    accepted: interviews.filter(
      (item) => item.studentResponse === "Accepted"
    ).length,
    pending: interviews.filter(
      (item) => item.studentResponse === "Pending"
    ).length,
  };

  const formatDate = (date) => {
    if (!date) return "Not specified";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusStyle = (status) => {
    const styles = {
      Scheduled: "bg-blue-100 text-blue-700",
      Rescheduled: "bg-purple-100 text-purple-700",
      Completed: "bg-green-100 text-green-700",
      Cancelled: "bg-red-100 text-red-700",
    };

    return styles[status] || "bg-gray-100 text-gray-700";
  };

  const getResponseStyle = (response) => {
    const styles = {
      Pending: "bg-amber-100 text-amber-700",
      Accepted: "bg-green-100 text-green-700",
      Declined: "bg-red-100 text-red-700",
    };

    return styles[response] || "bg-gray-100 text-gray-700";
  };

  const handleOpenReschedule = (interview) => {
    setRescheduleTarget(interview);

    const date = new Date(interview.interviewDate);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    setFormData({
      interviewType: interview.interviewType,
      interviewDate: `${year}-${month}-${day}`,
      interviewTime: interview.interviewTime || "",
      interviewMode: interview.interviewMode,
      meetingLink: interview.meetingLink || "",
      location: interview.location || "",
      instructions: interview.instructions || "",
    });

    setError("");
    setSuccess("");
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleReschedule = async (event) => {
    event.preventDefault();

    if (
      formData.interviewMode === "Online" &&
      !formData.meetingLink.trim()
    ) {
      setError("Please provide an online meeting link.");
      return;
    }

    if (
      formData.interviewMode === "In-Person" &&
      !formData.location.trim()
    ) {
      setError("Please provide an interview location.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const result = await rescheduleInterview(
        rescheduleTarget._id,
        formData
      );

      setInterviews((previous) =>
        previous.map((item) =>
          item._id === rescheduleTarget._id
            ? result.interview
            : item
        )
      );

      setSuccess(result.message);
      setRescheduleTarget(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to reschedule interview."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (interview) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel the interview with ${
        interview.student?.name || "this student"
      }?`
    );

    if (!confirmed) return;

    try {
      setActionId(interview._id);
      setError("");
      setSuccess("");

      const result = await cancelInterview(interview._id);

      setInterviews((previous) =>
        previous.map((item) =>
          item._id === interview._id
            ? result.interview
            : item
        )
      );

      setSuccess(result.message);
      setSelectedInterview(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to cancel interview."
      );
    } finally {
      setActionId(null);
    }
  };

  const handleComplete = async (interview) => {
    const confirmed = window.confirm(
      "Mark this interview as completed?"
    );

    if (!confirmed) return;

    try {
      setActionId(interview._id);
      setError("");
      setSuccess("");

      const result = await completeInterview(interview._id);

      setInterviews((previous) =>
        previous.map((item) =>
          item._id === interview._id
            ? result.interview
            : item
        )
      );

      setSuccess(result.message);
      setSelectedInterview(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to complete interview."
      );
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            CareerPilot
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-800">
            Interview Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your scheduled candidate interviews.
          </p>
        </div>

        <button
          onClick={fetchInterviews}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle size={18} />
          {success}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {[
          {
            label: "Total Interviews",
            value: stats.total,
            icon: CalendarDays,
            color: "text-blue-600",
          },
          {
            label: "Upcoming",
            value: stats.upcoming,
            icon: Clock,
            color: "text-purple-600",
          },
          {
            label: "Accepted",
            value: stats.accepted,
            icon: CheckCircle,
            color: "text-green-600",
          },
          {
            label: "Awaiting Response",
            value: stats.pending,
            icon: Users,
            color: "text-amber-600",
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {stat.label}
                </p>
                <Icon size={22} className={stat.color} />
              </div>

              <h2 className="mt-3 text-3xl font-bold text-slate-800">
                {stat.value}
              </h2>
            </div>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search student or job..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="All">All Interview Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Rescheduled">Rescheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={responseFilter}
            onChange={(event) => setResponseFilter(event.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="All">All Student Responses</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Declined">Declined</option>
          </select>

        </div>
      </div>

      {/* Interview List */}
      <div className="space-y-4">

        <h2 className="text-lg font-bold text-slate-800">
          Scheduled Interviews ({filteredInterviews.length})
        </h2>

        {filteredInterviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <CalendarDays
              size={36}
              className="mx-auto text-slate-400"
            />

            <h3 className="mt-4 text-lg font-semibold text-slate-800">
              No Interviews Found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Your scheduled interviews will appear here.
            </p>
          </div>
        ) : (
          filteredInterviews.map((interview) => (
            <div
              key={interview._id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <UserRound size={24} />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      {interview.student?.name || "Student"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {interview.student?.email || ""}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <BriefcaseBusiness size={15} />
                        {interview.job?.title || "Job Position"}
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={15} />
                        {formatDate(interview.interviewDate)}
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={15} />
                        {interview.interviewTime}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                      interview.status
                    )}`}
                  >
                    {interview.status}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getResponseStyle(
                      interview.studentResponse
                    )}`}
                  >
                    {interview.studentResponse}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex flex-col justify-between gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">

                <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    {interview.interviewMode === "Online" ? (
                      <Video size={16} />
                    ) : (
                      <MapPin size={16} />
                    )}
                    {interview.interviewMode}
                  </span>

                  <span>
                    {interview.interviewType} Interview
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">

                  <button
                    onClick={() => setSelectedInterview(interview)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Eye size={16} />
                    Details
                  </button>

                  {["Scheduled", "Rescheduled"].includes(
                    interview.status
                  ) && (
                    <>
                      <button
                        onClick={() => handleOpenReschedule(interview)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                      >
                        <Edit size={16} />
                        Reschedule
                      </button>

                      <button
                        onClick={() => handleCancel(interview)}
                        disabled={actionId === interview._id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <XCircle size={16} />
                        Cancel
                      </button>

                      {interview.studentResponse === "Accepted" && (
                        <button
                          onClick={() => handleComplete(interview)}
                          disabled={actionId === interview._id}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          <CheckCircle size={16} />
                          Complete
                        </button>
                      )}
                    </>
                  )}

                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Interview Details Modal */}
      {selectedInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-xl">

            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <h2 className="text-lg font-bold text-slate-800">
                Interview Details
              </h2>

              <button
                onClick={() => setSelectedInterview(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <p className="text-xs text-slate-500">Student</p>
                <p className="font-semibold text-slate-800">
                  {selectedInterview.student?.name}
                </p>
                <p className="text-sm text-slate-500">
                  {selectedInterview.student?.email}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Job Position</p>
                <p className="font-semibold text-slate-800">
                  {selectedInterview.job?.title}
                </p>
                <p className="text-sm text-slate-500">
                  {selectedInterview.job?.companyName}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Date</p>
                  <p className="text-sm font-medium text-slate-800">
                    {formatDate(selectedInterview.interviewDate)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Time</p>
                  <p className="text-sm font-medium text-slate-800">
                    {selectedInterview.interviewTime}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Interview Type</p>
                  <p className="text-sm font-medium text-slate-800">
                    {selectedInterview.interviewType}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Mode</p>
                  <p className="text-sm font-medium text-slate-800">
                    {selectedInterview.interviewMode}
                  </p>
                </div>
              </div>

              {selectedInterview.meetingLink && (
                <div>
                  <p className="text-xs text-slate-500">Meeting Link</p>
                  <a
                    href={selectedInterview.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-sm text-blue-600 hover:underline"
                  >
                    {selectedInterview.meetingLink}
                  </a>
                </div>
              )}

              {selectedInterview.location && (
                <div>
                  <p className="text-xs text-slate-500">Location</p>
                  <p className="text-sm text-slate-800">
                    {selectedInterview.location}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs text-slate-500">Instructions</p>
                <p className="whitespace-pre-wrap text-sm text-slate-700">
                  {selectedInterview.instructions || "No instructions provided."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(selectedInterview.status)}`}>
                  {selectedInterview.status}
                </span>

                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getResponseStyle(selectedInterview.studentResponse)}`}>
                  Student: {selectedInterview.studentResponse}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleReschedule}
            className="max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Reschedule Interview
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {rescheduleTarget.student?.name}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setRescheduleTarget(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Interview Type
              </label>
              <select
                name="interviewType"
                value={formData.interviewType}
                onChange={handleFormChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                required
              >
                <option value="Technical">Technical</option>
                <option value="HR">HR</option>
                <option value="Behavioral">Behavioral</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Interview Date
                </label>
                <input
                  type="date"
                  name="interviewDate"
                  value={formData.interviewDate}
                  onChange={handleFormChange}
                  min={new Date().toLocaleDateString("en-CA")}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Interview Time
                </label>
                <input
                  type="time"
                  name="interviewTime"
                  value={formData.interviewTime}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Interview Mode
              </label>
              <select
                name="interviewMode"
                value={formData.interviewMode}
                onChange={handleFormChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                required
              >
                <option value="Online">Online</option>
                <option value="In-Person">In-Person</option>
              </select>
            </div>

            {formData.interviewMode === "Online" ? (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Meeting Link
                </label>
                <input
                  type="url"
                  name="meetingLink"
                  value={formData.meetingLink}
                  onChange={handleFormChange}
                  placeholder="https://meet.google.com/..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Interview Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleFormChange}
                  placeholder="Enter interview location"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                  required
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Instructions
              </label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleFormChange}
                rows={3}
                placeholder="Enter any additional instructions..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              />
            </div>

            <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              The student's previous response will reset to Pending after rescheduling. They will receive a new notification.
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRescheduleTarget(null)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                Save New Schedule
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RecruiterInterviews;
