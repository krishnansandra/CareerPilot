
import { useEffect, useState } from "react";

import {
  CalendarDays,
  Clock,
  Video,
  MapPin,
  BriefcaseBusiness,
  UserRound,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2,
  AlertCircle,
  ClipboardList,
  ExternalLink,
} from "lucide-react";

import {
  getStudentInterviews,
  respondToInterview,
} from "../services/studentInterviewService";

const StudentInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getStudentInterviews();

      setInterviews(result.interviews || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load interview invitations."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleResponse = async (interviewId, response) => {
    const action = response === "Accepted" ? "accept" : "decline";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this interview invitation?`
    );

    if (!confirmed) return;

    try {
      setRespondingId(interviewId);
      setError("");
      setSuccess("");

      const result = await respondToInterview(interviewId, response);

      setInterviews((previous) =>
        previous.map((interview) =>
          interview._id === interviewId
            ? result.interview
            : interview
        )
      );

      setSuccess(result.message);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to submit your response."
      );
    } finally {
      setRespondingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Not specified";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            CareerPilot
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-800">
            Interview Invitations
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View and manage interview invitations from recruiters.
          </p>
        </div>

        <button
          onClick={fetchInterviews}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
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

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Total Invitations
            </p>
            <CalendarDays className="text-blue-600" size={22} />
          </div>

          <h2 className="mt-3 text-3xl font-bold text-slate-800">
            {interviews.length}
          </h2>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Awaiting Response
            </p>
            <Clock className="text-amber-600" size={22} />
          </div>

          <h2 className="mt-3 text-3xl font-bold text-slate-800">
            {
              interviews.filter(
                (item) => item.studentResponse === "Pending"
              ).length
            }
          </h2>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Accepted Invitations
            </p>
            <CheckCircle className="text-green-600" size={22} />
          </div>

          <h2 className="mt-3 text-3xl font-bold text-slate-800">
            {
              interviews.filter(
                (item) => item.studentResponse === "Accepted"
              ).length
            }
          </h2>
        </div>
      </div>

      {/* Interview Invitations */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-slate-800">
          Your Invitations
        </h2>

        {interviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <CalendarDays
                size={30}
                className="text-blue-600"
              />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-slate-800">
              No Interview Invitations Yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              When a recruiter schedules an interview for one of
              your applications, the invitation will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {interviews.map((interview) => (
              <div
                key={interview._id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="border-b border-slate-100 p-5">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <BriefcaseBusiness
                          size={20}
                          className="text-blue-600"
                        />

                        <h3 className="text-lg font-bold text-slate-800">
                          {interview.job?.title || "Job Position"}
                        </h3>
                      </div>

                      <p className="mt-2 text-sm text-slate-500">
                        {interview.job?.companyName || "Company"}
                      </p>
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
                </div>

                <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
                  {/* Interview Details */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <UserRound
                        size={18}
                        className="mt-0.5 text-slate-400"
                      />

                      <div>
                        <p className="text-xs text-slate-500">
                          Recruiter
                        </p>
                        <p className="text-sm font-medium text-slate-800">
                          {interview.recruiter?.name || "Recruiter"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {interview.recruiter?.email || ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CalendarDays
                        size={18}
                        className="mt-0.5 text-slate-400"
                      />

                      <div>
                        <p className="text-xs text-slate-500">
                          Interview Date
                        </p>
                        <p className="text-sm font-medium text-slate-800">
                          {formatDate(interview.interviewDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock
                        size={18}
                        className="mt-0.5 text-slate-400"
                      />

                      <div>
                        <p className="text-xs text-slate-500">
                          Interview Time
                        </p>
                        <p className="text-sm font-medium text-slate-800">
                          {interview.interviewTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <ClipboardList
                        size={18}
                        className="mt-0.5 text-slate-400"
                      />

                      <div>
                        <p className="text-xs text-slate-500">
                          Interview Type
                        </p>
                        <p className="text-sm font-medium text-slate-800">
                          {interview.interviewType}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mode and Instructions */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      {interview.interviewMode === "Online" ? (
                        <Video
                          size={18}
                          className="mt-0.5 text-slate-400"
                        />
                      ) : (
                        <MapPin
                          size={18}
                          className="mt-0.5 text-slate-400"
                        />
                      )}

                      <div>
                        <p className="text-xs text-slate-500">
                          Interview Mode
                        </p>
                        <p className="text-sm font-medium text-slate-800">
                          {interview.interviewMode}
                        </p>
                      </div>
                    </div>

                    {interview.interviewMode === "Online" &&
                      interview.meetingLink && (
                        <div className="flex items-start gap-3">
                          <ExternalLink
                            size={18}
                            className="mt-0.5 text-slate-400"
                          />

                          <div>
                            <p className="text-xs text-slate-500">
                              Meeting Link
                            </p>

                            <a
                              href={interview.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="break-all text-sm font-medium text-blue-600 hover:underline"
                            >
                              Join Interview
                            </a>
                          </div>
                        </div>
                      )}

                    {interview.interviewMode === "In-Person" &&
                      interview.location && (
                        <div className="flex items-start gap-3">
                          <MapPin
                            size={18}
                            className="mt-0.5 text-slate-400"
                          />

                          <div>
                            <p className="text-xs text-slate-500">
                              Interview Location
                            </p>
                            <p className="text-sm font-medium text-slate-800">
                              {interview.location}
                            </p>
                          </div>
                        </div>
                      )}

                    <div>
                      <p className="text-xs text-slate-500">
                        Recruiter Instructions
                      </p>

                      <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                        {interview.instructions ||
                          "No additional instructions provided."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col justify-between gap-3 border-t border-slate-100 bg-slate-50 p-5 sm:flex-row sm:items-center">
                  <p className="text-xs text-slate-500">
                    Invitation received on{" "}
                    {formatDate(interview.createdAt)}
                  </p>

                  {interview.studentResponse === "Pending" &&
                    ["Scheduled", "Rescheduled"].includes(
                      interview.status
                    ) && (
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() =>
                            handleResponse(interview._id, "Declined")
                          }
                          disabled={respondingId === interview._id}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          <XCircle size={17} />
                          Decline
                        </button>

                        <button
                          onClick={() =>
                            handleResponse(interview._id, "Accepted")
                          }
                          disabled={respondingId === interview._id}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                        >
                          {respondingId === interview._id ? (
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                          ) : (
                            <CheckCircle size={17} />
                          )}
                          Accept Invitation
                        </button>
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentInterviews;
