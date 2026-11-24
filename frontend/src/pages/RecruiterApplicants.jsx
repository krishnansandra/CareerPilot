
import { useEffect, useMemo, useState } from "react";

import {
  BriefcaseBusiness,
  CalendarDays,
  Mail,
  RefreshCw,
  Search,
  Eye,
  X,
  UserRound,
  Filter,
  MapPin,
  GraduationCap,
  Download,
  FileText,
  Phone,
  Globe,
  Code,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import {
  getRecruiterApplicants,
  updateApplicationStatus,
  downloadApplicantResume,
  viewApplicantResume, evaluateApplicant,  compareApplicantsWithAI,

} from "../services/applicationService";
import {
  scheduleInterview,
} from "../services/recruiterInterviewService";

function RecruiterApplicants() {
  const { token } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const [search, setSearch] = useState("");
  const [jobFilter, setJobFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");

  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [aiComparison, setAiComparison] = useState(null);
const [aiComparing, setAiComparing] = useState(false);
const [showAIComparison, setShowAIComparison] = useState(false);
const [aiComparisonError, setAiComparisonError] = useState("");
  const [resumeLoadingId, setResumeLoadingId] = useState("");
  // Applicant evaluation states
const [evaluationRating, setEvaluationRating] = useState("5");
const [evaluationStrengths, setEvaluationStrengths] = useState("");
const [evaluationWeaknesses, setEvaluationWeaknesses] = useState("");
const [evaluationNotes, setEvaluationNotes] = useState("");
const [savingEvaluation, setSavingEvaluation] = useState(false);
const [selectedApplicants, setSelectedApplicants] = useState([]);
const [showComparison, setShowComparison] = useState(false);
// Interview scheduling states
const [interviewType, setInterviewType] = useState("Technical");
const [interviewDate, setInterviewDate] = useState("");
const [interviewTime, setInterviewTime] = useState("");
const [interviewMode, setInterviewMode] = useState("Online");
const [meetingLink, setMeetingLink] = useState("");
const [interviewLocation, setInterviewLocation] = useState("");
const [interviewInstructions, setInterviewInstructions] = useState("");
const [schedulingInterview, setSchedulingInterview] = useState(false);



  // Fetch applicants
  const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getRecruiterApplicants(token);
      setApplications(data.applications || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load applicants."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchApplicants();
    }
  }, [token]);

  // Update application status
  const handleStatusChange = async (applicationId, status) => {
    try {
      setUpdatingId(applicationId);

      await updateApplicationStatus(applicationId, status, token);

      setApplications((previous) =>
        previous.map((application) =>
          application._id === applicationId
            ? { ...application, status }
            : application
        )
      );

      setSelectedApplicant((previous) =>
        previous?._id === applicationId
          ? { ...previous, status }
          : previous
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to update application status."
      );
    } finally {
      setUpdatingId("");
    }
  };

  // View applicant resume
  const handleViewResume = async (applicationId) => {
    const newTab = window.open("", "_blank");

    if (!newTab) {
      alert("Please allow pop-ups to view the resume.");
      return;
    }

    try {
      setResumeLoadingId(applicationId);

      const blob = await viewApplicantResume(applicationId, token);

      const fileUrl = window.URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" })
      );

      newTab.location.href = fileUrl;

      setTimeout(() => {
        window.URL.revokeObjectURL(fileUrl);
      }, 60000);
    } catch (err) {
      newTab.close();
      alert("Unable to view applicant resume.");
    } finally {
      setResumeLoadingId("");
    }
  };

  // Download applicant resume
  const handleDownloadResume = async (applicationId, fileName) => {
    try {
      setResumeLoadingId(applicationId);

      const blob = await downloadApplicantResume(applicationId, token);

      const fileUrl = window.URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" })
      );

      const link = document.createElement("a");

      link.href = fileUrl;
      link.download = fileName || "Applicant_Resume.pdf";

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => {
        window.URL.revokeObjectURL(fileUrl);
      }, 1000);
    } catch (err) {
      alert("Unable to download applicant resume.");
    } finally {
      setResumeLoadingId("");
    }
  };

  // Format date
  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Not available";

  // Status colors
  const statusColors = {
    Applied: "bg-blue-50 text-blue-700",
    "Under Review": "bg-amber-50 text-amber-700",
    Shortlisted: "bg-green-50 text-green-700",
    Rejected: "bg-red-50 text-red-700",
    Hired: "bg-purple-50 text-purple-700",
  };

  // Unique job positions
  const jobs = useMemo(() => {
    const uniqueJobs = new Map();

    applications.forEach((application) => {
      if (application.job?._id) {
        uniqueJobs.set(
          application.job._id,
          application.job.title || "Untitled Job"
        );
      }
    });

    return Array.from(uniqueJobs, ([id, title]) => ({
      id,
      title,
    }));
  }, [applications]);

  // Search, filter and sort
  const filteredApplications = useMemo(() => {
    const filtered = applications.filter((application) => {
      const studentName = application.student?.name || "";
      const email = application.student?.email || "";
      const jobTitle = application.job?.title || "";

      const skills =
        application.studentProfile?.skills?.join(" ") || "";

      const location =
        application.studentProfile?.location || "";

      const searchContent = `
        ${studentName}
        ${email}
        ${jobTitle}
        ${skills}
        ${location}
      `.toLowerCase();

      const searchMatch = searchContent.includes(
        search.trim().toLowerCase()
      );

      const jobMatch =
        jobFilter === "All" ||
        application.job?._id === jobFilter;

      const statusMatch =
        statusFilter === "All" ||
        application.status === statusFilter;

      return searchMatch && jobMatch && statusMatch;
    });

    const statusPriority = {
      Applied: 1,
      "Under Review": 2,
      Shortlisted: 3,
      Rejected: 4,
      Hired: 5,
    };

    return [...filtered].sort((a, b) => {
      if (sortOrder === "newest") {
        return (
          new Date(b.appliedAt || 0).getTime() -
          new Date(a.appliedAt || 0).getTime()
        );
      }

      if (sortOrder === "oldest") {
        return (
          new Date(a.appliedAt || 0).getTime() -
          new Date(b.appliedAt || 0).getTime()
        );
      }

      if (sortOrder === "status") {
        return (
          (statusPriority[a.status] || 99) -
          (statusPriority[b.status] || 99)
        );
      }

      return 0;
    });
  }, [
    applications,
    search,
    jobFilter,
    statusFilter,
    sortOrder,
  ]);

  // Count application statuses
  const countStatus = (status) =>
    applications.filter(
      (application) => application.status === status
    ).length;

  // Clear filters
  const clearFilters = () => {
    setSearch("");
    setJobFilter("All");
    setStatusFilter("All");
    setSortOrder("newest");
  };

// Load an applicant's existing evaluation
const openApplicantDetails = (application) => {
  setSelectedApplicant(application);

  const evaluation = application.recruiterEvaluation || {};

  setEvaluationRating(
    evaluation.rating ? String(evaluation.rating) : "5"
  );

  setEvaluationStrengths(
    evaluation.strengths?.join("\n") || ""
  );

  setEvaluationWeaknesses(
    evaluation.weaknesses?.join("\n") || ""
  );

  setEvaluationNotes(evaluation.notes || "");
};

// Save applicant evaluation
const handleSaveEvaluation = async () => {
  if (!selectedApplicant) return;

  const rating = Number(evaluationRating);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    alert("Please select a rating between 1 and 5.");
    return;
  }

  const evaluationData = {
    rating,
    strengths: evaluationStrengths
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    weaknesses: evaluationWeaknesses
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    notes: evaluationNotes.trim(),
  };

  try {
    setSavingEvaluation(true);

    const response = await evaluateApplicant(
      selectedApplicant._id,
      evaluationData,
      token
    );

    const updatedEvaluation =
      response.evaluation || evaluationData;

    const updatedApplication = {
      ...selectedApplicant,
      recruiterEvaluation: updatedEvaluation,
    };

    setSelectedApplicant(updatedApplication);

    setApplications((previous) =>
      previous.map((application) =>
        application._id === selectedApplicant._id
          ? updatedApplication
          : application
      )
    );

    alert("Applicant evaluation saved successfully!");
  } catch (err) {
    alert(
      err.response?.data?.message ||
        "Unable to save applicant evaluation."
    );
  } finally {
    setSavingEvaluation(false);
  }
};

// Schedule an interview
const handleScheduleInterview = async () => {
  if (!selectedApplicant) return;

  if (!interviewDate || !interviewTime) {
    alert("Please select an interview date and time.");
    return;
  }

  if (interviewMode === "Online" && !meetingLink.trim()) {
    alert("Please enter the meeting link.");
    return;
  }

  if (interviewMode === "In-Person" && !interviewLocation.trim()) {
    alert("Please enter the interview location.");
    return;
  }

  const selectedDateTime = new Date(
    `${interviewDate}T${interviewTime}`
  );

  if (Number.isNaN(selectedDateTime.getTime()) || selectedDateTime <= new Date()) {
    alert("Please select a future interview date and time.");
    return;
  }

  const interviewData = {
    interviewType,
    interviewDate,
    interviewTime,
    interviewMode,
    meetingLink,
    location: interviewLocation,
    instructions: interviewInstructions,
  };

  try {
    setSchedulingInterview(true);

    const response = await scheduleInterview(
      selectedApplicant._id,
      interviewData
    );

    alert(
      response.message || "Interview scheduled successfully!"
    );

    // Reset the form
    setInterviewType("Technical");
    setInterviewDate("");
    setInterviewTime("");
    setInterviewMode("Online");
    setMeetingLink("");
    setInterviewLocation("");
    setInterviewInstructions("");
  } catch (err) {
    alert(
      err.response?.data?.message ||
        "Unable to schedule the interview."
    );
  } finally {
    setSchedulingInterview(false);
  }
};

// Select or deselect applicants for comparison
const toggleApplicantSelection = (application) => {
  setSelectedApplicants((previous) => {
    const alreadySelected = previous.some(
      (item) => item._id === application._id
    );

    if (alreadySelected) {
      return previous.filter(
        (item) => item._id !== application._id
      );
    }

    if (previous.length >= 3) {
      alert("You can compare a maximum of 3 applicants.");
      return previous;
    }

    if (
      previous.length > 0 &&
      previous[0].job?._id !== application.job?._id
    ) {
      alert("Please select applicants for the same job position.");
      return previous;
    }

    return [...previous, application];
  });
};
const handleAIComparison = async () => {
  if (selectedApplicants.length < 2) {
    alert("Please select at least 2 applicants to compare.");
    return;
  }

  try {
    setAiComparing(true);
    setAiComparisonError("");
    setAiComparison(null);

    const applicationIds = selectedApplicants.map(
      (applicant) => applicant._id
    );

    const result = await compareApplicantsWithAI(
      applicationIds,
      token
    );

    setAiComparison(result.comparison);
    setShowAIComparison(true);
  } catch (error) {
    console.error("AI Comparison Error:", error);

    setAiComparisonError(
      error.response?.data?.message ||
      "Unable to compare applicants. Please try again."
    );
  } finally {
    setAiComparing(false);
  }
};

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center text-slate-500">
        Loading applicants...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#111C35]">
            Job Applicants
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Search, review and manage applications submitted to your jobs.
          </p>
        </div>

        <button
          onClick={fetchApplicants}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            label: "Total Applications",
            count: applications.length,
          },
          {
            label: "Under Review",
            count: countStatus("Under Review"),
          },
          {
            label: "Shortlisted",
            count: countStatus("Shortlisted"),
          },
          {
            label: "Hired",
            count: countStatus("Hired"),
          },
          {
            label: "Rejected",
            count: countStatus("Rejected"),
          },
          {
            label: "New Applications",
            count: countStatus("Applied"),
          },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white border border-slate-200 rounded-2xl p-5"
          >
            <p className="text-sm text-slate-500">
              {item.label}
            </p>

            <h3 className="text-2xl font-bold text-[#111C35] mt-2">
              {item.count}
            </h3>
          </div>
        ))}
      </div>

      {/* Search, Filters and Sorting */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-blue-600" />

          <h3 className="font-semibold text-[#111C35]">
            Search and Manage Applicants
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Search */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search name, email, skills or job..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Job Filter */}
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Job Positions</option>

            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Application Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Rejected">Rejected</option>
            <option value="Hired">Hired</option>
          </select>

          {/* Sorting */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>

        <div className="flex justify-between items-center mt-4">
          <p className="text-xs text-slate-500">
            Showing {filteredApplications.length} of {applications.length} applications
          </p>

          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 font-semibold hover:underline"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Applicant List */}
      {applications.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <BriefcaseBusiness
            size={38}
            className="mx-auto text-slate-300"
          />

          <h3 className="text-lg font-bold text-[#111C35] mt-4">
            No applications yet
          </h3>

          <p className="text-sm text-slate-500 mt-2">
            Applications for your job postings will appear here.
          </p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <Search
            size={34}
            className="mx-auto text-slate-300"
          />

          <h3 className="text-lg font-bold text-[#111C35] mt-4">
            No matching applicants
          </h3>

          <p className="text-sm text-slate-500 mt-2">
            Try changing your search or filters.
          </p>

          <button
            onClick={clearFilters}
            className="mt-4 text-blue-600 font-semibold text-sm"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredApplications.map((application) => (
            <div
              key={application._id}
              className="bg-white border border-slate-200 rounded-2xl p-6"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-5">
                <div className="flex items-center gap-2 mb-4">
  <input
    type="checkbox"
    checked={selectedApplicants.some(
      (item) => item._id === application._id
    )}
    onChange={() => toggleApplicantSelection(application)}
    className="w-4 h-4 accent-blue-600 cursor-pointer"
  />

  <span className="text-sm text-slate-600">
    Select for comparison
  </span>
</div>

                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-[#111C35]">
                    {application.student?.name || "Student"}
                  </h3>

                  <p className="text-sm text-slate-500 flex items-center gap-2 mt-2">
                    <Mail size={15} />
                    {application.student?.email || "Email unavailable"}
                  </p>

                  <p className="text-sm text-blue-700 font-medium flex items-center gap-2 mt-3">
                    <BriefcaseBusiness size={15} />
                    {application.job?.title || "Job unavailable"}
                  </p>

                  <p className="text-xs text-slate-400 flex items-center gap-2 mt-2">
                    <CalendarDays size={14} />
                    Applied on {formatDate(application.appliedAt)}
                  </p>

                  {application.studentProfile?.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {application.studentProfile.skills
                        .slice(0, 5)
                        .map((skill, index) => (
                          <span
                            key={index}
                            className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">

                  <span
                    className={`w-fit px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      statusColors[application.status] ||
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {application.status}
                  </span>

                  <select
                    value={application.status}
                    disabled={updatingId === application._id}
                    onChange={(e) =>
                      handleStatusChange(
                        application._id,
                        e.target.value
                      )
                    }
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Hired">Hired</option>
                  </select>

                  <button
                    onClick={() => openApplicantDetails(application)}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100"
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                </div>
              </div>

              {application.coverLetter && (
                <div className="mt-5 pt-5 border-t border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-700">
                    Cover Letter
                  </h4>

                  <p className="text-sm text-slate-600 mt-2 leading-6 whitespace-pre-line">
                    {application.coverLetter}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

{/* Compare Applicants Button */}

{/* Applicant Comparison Actions */}
{selectedApplicants.length >= 2 && (
  <div className="fixed bottom-6 right-6 z-40 flex flex-col sm:flex-row gap-3">
    <button
      onClick={() => setShowComparison(true)}
      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl shadow-lg font-semibold text-sm"
    >
      Compare {selectedApplicants.length} Applicants
    </button>

    <button
      onClick={handleAIComparison}
      disabled={aiComparing}
      className="bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white px-5 py-3 rounded-xl shadow-lg font-semibold text-sm"
    >
      {aiComparing ? "AI Comparing..." : "✨ Compare with AI"}
    </button>
  </div>
)}

{aiComparisonError && (
  <div className="fixed bottom-24 right-6 z-40 max-w-sm bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 shadow-lg text-sm">
    {aiComparisonError}
    <button
      onClick={() => setAiComparisonError("")}
      className="ml-2 font-bold"
    >
      Dismiss
    </button>
  </div>
)}



{/* AI Applicant Comparison Results Modal */}
{showAIComparison && aiComparison && (
  <div className="fixed inset-0 z-[70] bg-slate-950/70 flex items-center justify-center p-4">
    <div className="bg-white w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl">

      {/* Header */}
      <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b border-slate-100">
        <div>
          <h3 className="text-xl font-bold text-[#111C35]">
            AI Candidate Comparison
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            AI-powered evaluation for {aiComparison.jobTitle || "the selected position"}
          </p>
        </div>

        <button
          onClick={() => setShowAIComparison(false)}
          className="p-2 rounded-lg hover:bg-slate-100"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-6 space-y-7">

        {/* Overall Summary */}
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5">
          <h4 className="font-bold text-purple-900">
            AI Comparison Summary
          </h4>
          <p className="text-sm text-purple-800 leading-6 mt-2">
            {aiComparison.overallSummary || "No summary available."}
          </p>
        </div>

        {/* Candidate Match Cards */}
        <div>
          <h4 className="text-lg font-bold text-[#111C35] mb-4">
            Individual Candidate Analysis
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(aiComparison.candidateResults || []).map((candidate) => (
              <div
                key={candidate.applicationId}
                className="border border-slate-200 rounded-2xl p-5 space-y-4"
              >
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h5 className="font-bold text-[#111C35]">
                      {candidate.candidateName}
                    </h5>
                    <p className="text-xs text-slate-500 mt-1">
                      {candidate.matchLevel || "Match assessment"}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-2xl font-bold text-purple-700">
                      {candidate.matchPercentage}%
                    </p>
                    <p className="text-xs text-slate-500">
                      Job Match
                    </p>
                  </div>
                </div>

                {/* Match Progress */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, Number(candidate.matchPercentage) || 0)
                      )}%`,
                    }}
                  />
                </div>

                {/* Matched Skills */}
                <div>
                  <h6 className="text-sm font-semibold text-green-700 mb-2">
                    Matched Skills
                  </h6>
                  <div className="flex flex-wrap gap-2">
                    {(candidate.skillMatch?.matchedSkills || []).length > 0 ? (
                      candidate.skillMatch.matchedSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-xs"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500">
                        No matched skills identified.
                      </p>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div>
                  <h6 className="text-sm font-semibold text-red-700 mb-2">
                    Missing Required Skills
                  </h6>
                  <div className="flex flex-wrap gap-2">
                    {(candidate.skillMatch?.missingSkills || []).length > 0 ? (
                      candidate.skillMatch.missingSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 text-xs"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500">
                        No missing skills identified.
                      </p>
                    )}
                  </div>
                </div>

                {/* Additional Skills */}
                <div>
                  <h6 className="text-sm font-semibold text-blue-700 mb-2">
                    Additional Skills
                  </h6>
                  <div className="flex flex-wrap gap-2">
                    {(candidate.skillMatch?.additionalSkills || []).length > 0 ? (
                      candidate.skillMatch.additionalSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500">
                        No additional skills identified.
                      </p>
                    )}
                  </div>
                </div>

                {/* Education and Experience */}
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <div>
                    <h6 className="text-sm font-semibold text-slate-800">
                      Education Assessment
                    </h6>
                    <p className="text-sm text-slate-600 mt-1 leading-6">
                      {candidate.educationAssessment || "Not available."}
                    </p>
                  </div>

                  <div>
                    <h6 className="text-sm font-semibold text-slate-800">
                      Experience Assessment
                    </h6>
                    <p className="text-sm text-slate-600 mt-1 leading-6">
                      {candidate.experienceAssessment || "Not available."}
                    </p>
                  </div>

                  <div>
                    <h6 className="text-sm font-semibold text-slate-800">
                      Project Assessment
                    </h6>
                    <p className="text-sm text-slate-600 mt-1 leading-6">
                      {candidate.projectAssessment || "Not available."}
                    </p>
                  </div>
                </div>

                {/* Strengths */}
                <div>
                  <h6 className="text-sm font-semibold text-green-700 mb-2">
                    Strengths
                  </h6>
                  <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                    {(candidate.strengths || []).length > 0 ? (
                      candidate.strengths.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))
                    ) : (
                      <li>No strengths identified.</li>
                    )}
                  </ul>
                </div>

                {/* Improvement Areas */}
                <div>
                  <h6 className="text-sm font-semibold text-amber-700 mb-2">
                    Areas for Improvement
                  </h6>
                  <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                    {(candidate.improvementAreas || []).length > 0 ? (
                      candidate.improvementAreas.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))
                    ) : (
                      <li>No improvement areas identified.</li>
                    )}
                  </ul>
                </div>

                {/* Reasoning */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <h6 className="text-sm font-semibold text-[#111C35]">
                    AI Assessment
                  </h6>
                  <p className="text-sm text-slate-600 mt-2 leading-6">
                    {candidate.reasoning || "No explanation available."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side-by-side Comparison */}
        {aiComparison.comparison && (
          <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
            <h4 className="font-bold text-lg text-[#111C35]">
              Side-by-Side Comparison
            </h4>

            <div>
              <p className="text-sm font-semibold text-slate-700">
                Strongest Technical Match
              </p>
              <p className="text-sm text-slate-600 mt-1">
                {aiComparison.comparison.strongestTechnicalMatch || "Not available"}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700">
                Strongest Experience Match
              </p>
              <p className="text-sm text-slate-600 mt-1">
                {aiComparison.comparison.strongestExperienceMatch || "Not available"}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">
                Key Differences
              </p>
              <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                {(aiComparison.comparison.keyDifferences || []).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">
                Information Gaps
              </p>
              <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                {(aiComparison.comparison.informationGaps || []).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* AI Recommendation */}
        {aiComparison.recommendation && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-3">
            <h4 className="font-bold text-lg text-blue-900">
              AI Recommendation
            </h4>

            <p className="text-sm text-blue-900">
              <strong>Suggested Candidate:</strong>{" "}
              {aiComparison.recommendation.suggestedCandidate || "No clear preference"}
            </p>

            <div>
              <p className="text-sm font-semibold text-blue-900">
                Reason
              </p>
              <p className="text-sm text-blue-800 mt-1 leading-6">
                {aiComparison.recommendation.reason || "No reason provided."}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-blue-900">
                Other Candidates
              </p>
              <p className="text-sm text-blue-800 mt-1 leading-6">
                {aiComparison.recommendation.otherCandidates || "Not available."}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-blue-900">
                Important Limitations
              </p>
              <p className="text-sm text-blue-800 mt-1 leading-6">
                {aiComparison.recommendation.caution || "Review all candidate information before making a decision."}
              </p>
            </div>
          </div>
        )}

        <p className="text-xs text-slate-500 leading-5">
          AI-generated comparison is an advisory tool based on the available
          job-related information. Review original applications and conduct
          your own assessment before making hiring decisions.
        </p>

        {/* Footer */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowAIComparison(false)}
            className="px-6 py-3 rounded-xl bg-[#111C35] text-white text-sm font-semibold hover:bg-slate-800"
          >
            Close AI Comparison
          </button>
        </div>

      </div>
    </div>
  </div>
)}





{/* Applicant Comparison Modal */}
{showComparison && selectedApplicants.length >= 2 && (
  <div className="fixed inset-0 z-[60] bg-slate-950/60 flex items-center justify-center p-4">

    <div className="bg-white w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl">

      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <div>
          <h3 className="text-xl font-bold text-[#111C35]">
            Applicant Comparison
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Compare applicants for the same job position.
          </p>
        </div>

        <button
          onClick={() => setShowComparison(false)}
          className="p-2 rounded-lg hover:bg-slate-100"
        >
          <X size={20} />
        </button>
      </div>

      {/* Comparison Table */}
      <div className="p-6 overflow-x-auto">

        <table className="w-full min-w-[750px] border-collapse text-sm">

          <thead>
            <tr>
              <th className="text-left p-4 bg-slate-50 border">
                Comparison Criteria
              </th>

              {selectedApplicants.map((applicant) => (
                <th
                  key={applicant._id}
                  className="text-left p-4 bg-blue-50 border"
                >
                  {applicant.student?.name || "Student"}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {[
              {
                label: "Email",
                value: (app) => app.student?.email || "Not available",
              },
              {
                label: "Job Position",
                value: (app) => app.job?.title || "Not available",
              },
              {
                label: "Application Status",
                value: (app) => app.status || "Not available",
              },
              {
                label: "Applied Date",
                value: (app) => formatDate(app.appliedAt),
              },
              {
                label: "Education",
                value: (app) =>
                  app.studentProfile?.education?.qualification || "Not provided",
              },
              {
                label: "Institution",
                value: (app) =>
                  app.studentProfile?.education?.institution || "Not provided",
              },
              {
                label: "Graduation Year",
                value: (app) =>
                  app.studentProfile?.education?.graduationYear || "Not provided",
              },
              {
                label: "Location",
                value: (app) =>
                  app.studentProfile?.location || "Not provided",
              },
              {
                label: "Experience",
                value: (app) =>
                  app.studentProfile?.experience?.jobTitle
                    ? `${app.studentProfile.experience.jobTitle} at ${
                        app.studentProfile.experience.company || "Not specified"
                      }`
                    : "Not provided",
              },
              {
                label: "Skills",
                value: (app) =>
                  app.studentProfile?.skills?.join(", ") || "Not provided",
              },
              {
                label: "Resume",
                value: (app) =>
                  app.resume?.fileName || "Not uploaded",
              },
              {
                label: "Recruiter Rating",
                value: (app) =>
                  app.recruiterEvaluation?.rating
                    ? `${app.recruiterEvaluation.rating} / 5`
                    : "Not evaluated",
              },
              {
                label: "Strengths",
                value: (app) =>
                  app.recruiterEvaluation?.strengths?.join(", ") ||
                  "Not evaluated",
              },
              {
                label: "Areas for Improvement",
                value: (app) =>
                  app.recruiterEvaluation?.weaknesses?.join(", ") ||
                  "Not evaluated",
              },
              {
                label: "Recruiter Notes",
                value: (app) =>
                  app.recruiterEvaluation?.notes || "No notes",
              },
            ].map((criterion) => (
              <tr key={criterion.label}>
                <td className="p-4 border bg-slate-50 font-semibold text-slate-700">
                  {criterion.label}
                </td>

                {selectedApplicants.map((applicant) => (
                  <td
                    key={applicant._id}
                    className="p-4 border text-slate-600 align-top"
                  >
                    {criterion.value(applicant)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap justify-end gap-3 p-6 border-t border-slate-100">

        <button
          onClick={() => {
            setSelectedApplicants([]);
            setShowComparison(false);
          }}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50"
        >
          Clear Selection
        </button>

        <button
          onClick={() => setShowComparison(false)}
          className="px-5 py-2.5 rounded-xl bg-[#111C35] text-white text-sm font-semibold hover:bg-slate-800"
        >
          Close
        </button>

      </div>

    </div>
  </div>
)}




      {/* Applicant Details Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-[#111C35]">
                  Applicant Details
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Review the submitted application and student profile.
                </p>
              </div>

              <button
                onClick={() => setSelectedApplicant(null)}
                className="p-2 rounded-lg hover:bg-slate-100"
                aria-label="Close applicant details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">

              {/* Student Information */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserRound size={26} />
                </div>

                <div>
                  <h4 className="font-bold text-lg text-[#111C35]">
                    {selectedApplicant.student?.name || "Student"}
                  </h4>

                  <p className="text-sm text-slate-500">
                    {selectedApplicant.student?.email || "Email unavailable"}
                  </p>
                </div>
              </div>

              {/* Application Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500">Applied Position</p>
                  <p className="font-semibold text-sm text-[#111C35] mt-1">
                    {selectedApplicant.job?.title || "Not available"}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500">Application Date</p>
                  <p className="font-semibold text-sm text-[#111C35] mt-1">
                    {formatDate(selectedApplicant.appliedAt)}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500">Current Status</p>
                  <p className="font-semibold text-sm text-[#111C35] mt-1">
                    {selectedApplicant.status}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500">Student ID</p>
                  <p className="font-semibold text-sm text-[#111C35] mt-1 break-all">
                    {selectedApplicant.student?._id || "Not available"}
                  </p>
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <h4 className="font-semibold text-[#111C35] flex items-center gap-2">
                  <Mail size={17} />
                  Cover Letter
                </h4>

                <div className="mt-2 bg-slate-50 rounded-xl p-4 text-sm text-slate-600 leading-6 whitespace-pre-line">
                  {selectedApplicant.coverLetter ||
                    "No cover letter was submitted."}
                </div>
              </div>

              {/* Student Profile */}
              {(() => {
                const profile = selectedApplicant.studentProfile || {};

                return (
                  <div className="space-y-4">

                    <h4 className="font-semibold text-lg text-[#111C35]">
                      Student Profile
                    </h4>

                    {/* Contact Information */}
                    <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                      <h5 className="font-semibold text-sm text-[#111C35]">
                        Contact Information
                      </h5>

                      <p className="text-sm text-slate-600 flex items-center gap-2">
                        <Phone size={15} />
                        {profile.phone || "Phone not provided"}
                      </p>

                      <p className="text-sm text-slate-600 flex items-center gap-2">
                        <MapPin size={15} />
                        {profile.location || "Location not provided"}
                      </p>
                    </div>

                    {/* Professional Summary */}
                    <div className="bg-slate-50 rounded-xl p-4">
                      <h5 className="font-semibold text-sm text-[#111C35] mb-2">
                        Professional Summary
                      </h5>

                      <p className="text-sm text-slate-600 leading-6 whitespace-pre-line">
                        {profile.professionalSummary ||
                          "No professional summary provided."}
                      </p>
                    </div>

                    {/* Education */}
                    <div className="bg-slate-50 rounded-xl p-4">
                      <h5 className="font-semibold text-sm text-[#111C35] mb-3 flex items-center gap-2">
                        <GraduationCap size={17} />
                        Education
                      </h5>

                      {profile.education?.qualification ? (
                        <>
                          <p className="font-medium text-sm text-slate-800">
                            {profile.education.qualification}
                          </p>

                          <p className="text-sm text-slate-600 mt-1">
                            {profile.education.institution}
                          </p>

                          <p className="text-sm text-slate-500 mt-1">
                            {profile.education.specialization}
                          </p>

                          <p className="text-sm text-slate-500 mt-1">
                            Graduation Year: {profile.education.graduationYear || "Not provided"}
                          </p>

                          <p className="text-sm text-slate-500">
                            Grade: {profile.education.grade || "Not provided"}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-slate-500">
                          Education details not provided.
                        </p>
                      )}
                    </div>

                    {/* Skills */}
                    <div className="bg-slate-50 rounded-xl p-4">
                      <h5 className="font-semibold text-sm text-[#111C35] mb-3 flex items-center gap-2">
                        <Code size={17} />
                        Skills
                      </h5>

                      {profile.skills?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">
                          No skills added.
                        </p>
                      )}
                    </div>

                    {/* Experience */}
                    <div className="bg-slate-50 rounded-xl p-4">
                      <h5 className="font-semibold text-sm text-[#111C35] mb-3 flex items-center gap-2">
                        <BriefcaseBusiness size={17} />
                        Work Experience
                      </h5>

                      {profile.experience?.jobTitle ? (
                        <>
                          <p className="font-medium text-sm text-slate-800">
                            {profile.experience.jobTitle}
                          </p>

                          <p className="text-sm text-slate-600 mt-1">
                            {profile.experience.company}
                          </p>

                          <p className="text-sm text-slate-500 mt-1">
                            {profile.experience.employmentType}
                          </p>

                          <p className="text-sm text-slate-600 mt-2 whitespace-pre-line">
                            {profile.experience.description}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-slate-500">
                          No experience details provided.
                        </p>
                      )}
                    </div>

                    {/* Projects */}
                    <div className="bg-slate-50 rounded-xl p-4">
                      <h5 className="font-semibold text-sm text-[#111C35] mb-3 flex items-center gap-2">
                        <Code size={17} />
                        Projects
                      </h5>

                      {profile.projects?.title ? (
                        <>
                          <p className="font-medium text-sm text-slate-800">
                            {profile.projects.title}
                          </p>

                          <p className="text-sm text-slate-600 mt-2 whitespace-pre-line">
                            {profile.projects.description}
                          </p>

                          {profile.projects.technologies?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {profile.projects.technologies.map(
                                (technology, index) => (
                                  <span
                                    key={index}
                                    className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs text-slate-600"
                                  >
                                    {technology}
                                  </span>
                                )
                              )}
                            </div>
                          )}

                          {profile.projects.projectUrl && (
                            <a
                              href={profile.projects.projectUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block mt-3 text-sm text-blue-600 hover:underline"
                            >
                              View Project
                            </a>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-slate-500">
                          No projects added.
                        </p>
                      )}
                    </div>

                    {/* Career Interests */}
                    <div className="bg-slate-50 rounded-xl p-4">
                      <h5 className="font-semibold text-sm text-[#111C35] mb-2">
                        Career Interests
                      </h5>

                      <p className="text-sm text-slate-600">
                        {Array.isArray(profile.careerInterests)
                          ? profile.careerInterests.join(", ") || "Not provided"
                          : profile.careerInterests || "Not provided"}
                      </p>

                      {profile.preferredJobRoles?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {profile.preferredJobRoles.map((role, index) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 text-xs"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Professional Links */}
                    <div className="bg-slate-50 rounded-xl p-4">
                      <h5 className="font-semibold text-sm text-[#111C35] mb-3">
                        Professional Links
                      </h5>

                      <div className="flex flex-wrap gap-4 text-sm">

                        {profile.linkedinUrl && (
                          <a
                            href={profile.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Globe size={15} />
                            LinkedIn
                          </a>
                        )}

                        {profile.githubUrl && (
                          <a
                            href={profile.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Code size={15} />
                            GitHub
                          </a>
                        )}

                        {profile.portfolioUrl && (
                          <a
                            href={profile.portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Globe size={15} />
                            Portfolio
                          </a>
                        )}

                        {!profile.linkedinUrl &&
                          !profile.githubUrl &&
                          !profile.portfolioUrl && (
                            <p className="text-slate-500">
                              No professional links provided.
                            </p>
                          )}
                      </div>
                    </div>

                  </div>
                );
              })()}

              {/* Applicant Resume */}
              <div>
                <h4 className="font-semibold text-[#111C35] flex items-center gap-2">
                  <FileText size={17} />
                  Applicant Resume
                </h4>

                {selectedApplicant.resume ? (
                  <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-4">

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                      <div className="flex items-center gap-3 min-w-0">
                        <FileText
                          size={28}
                          className="text-blue-600 shrink-0"
                        />

                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-[#111C35] truncate">
                            {selectedApplicant.resume.fileName}
                          </p>

                          <p className="text-xs text-slate-500 mt-1">
                            Uploaded on{" "}
                            {formatDate(selectedApplicant.resume.uploadedAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() =>
                            handleViewResume(selectedApplicant._id)
                          }
                          disabled={resumeLoadingId === selectedApplicant._id}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-blue-200 text-blue-700 text-sm font-semibold hover:bg-blue-100 disabled:opacity-50"
                        >
                          <Eye size={15} />
                          View
                        </button>

                        <button
                          onClick={() =>
                            handleDownloadResume(
                              selectedApplicant._id,
                              selectedApplicant.resume.fileName
                            )
                          }
                          disabled={resumeLoadingId === selectedApplicant._id}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                        >
                          <Download size={15} />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-500 bg-slate-50 rounded-xl p-4">
                    This applicant has not uploaded a resume yet.
                  </p>
                )}
              </div>



{/* Interview Scheduling */}
<div className="border border-purple-100 rounded-2xl p-5 bg-purple-50/40 space-y-4">

  <div>
    <h4 className="font-bold text-lg text-[#111C35]">
      Schedule Interview
    </h4>
    <p className="text-sm text-slate-500 mt-1">
      Send an interview invitation to this applicant.
    </p>
  </div>

  {/* Interview Type */}
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">
      Interview Type
    </label>

    <select
      value={interviewType}
      onChange={(e) => setInterviewType(e.target.value)}
      className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white text-sm"
    >
      <option value="Technical">Technical</option>
      <option value="HR">HR</option>
      <option value="Behavioral">Behavioral</option>
      <option value="Mixed">Mixed</option>
    </select>
  </div>

  {/* Date and Time */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Interview Date
      </label>

      <input
        type="date"
        min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 10)}
        value={interviewDate}
        onChange={(e) => setInterviewDate(e.target.value)}
        className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white text-sm"
      />
    </div>

    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Interview Time
      </label>

      <input
        type="time"
        value={interviewTime}
        onChange={(e) => setInterviewTime(e.target.value)}
        className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white text-sm"
      />
    </div>
  </div>

  {/* Interview Mode */}
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">
      Interview Mode
    </label>

    <select
      value={interviewMode}
      onChange={(e) => setInterviewMode(e.target.value)}
      className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white text-sm"
    >
      <option value="Online">Online</option>
      <option value="In-Person">In-Person</option>
    </select>
  </div>

  {/* Online Meeting Link */}
  {interviewMode === "Online" && (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Meeting Link
      </label>

      <input
        type="url"
        value={meetingLink}
        onChange={(e) => setMeetingLink(e.target.value)}
        placeholder="https://meet.google.com/..."
        className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white text-sm"
      />
    </div>
  )}

  {/* In-Person Location */}
  {interviewMode === "In-Person" && (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Interview Location
      </label>

      <input
        type="text"
        value={interviewLocation}
        onChange={(e) => setInterviewLocation(e.target.value)}
        placeholder="Enter office address"
        className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white text-sm"
      />
    </div>
  )}

  {/* Instructions */}
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">
      Additional Instructions
    </label>

    <textarea
      rows={3}
      value={interviewInstructions}
      onChange={(e) => setInterviewInstructions(e.target.value)}
      placeholder="Enter any instructions for the applicant..."
      className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white text-sm"
    />
  </div>

  {/* Submit */}
  <button
    type="button"
    onClick={handleScheduleInterview}
    disabled={schedulingInterview}
    className="w-full bg-purple-600 text-white rounded-xl py-3 font-semibold text-sm hover:bg-purple-700 disabled:opacity-50"
  >
    {schedulingInterview
      ? "Scheduling Interview..."
      : "Send Interview Invitation"}
  </button>

</div>




{/* Recruiter Evaluation */}
<div className="border border-blue-100 rounded-2xl p-5 bg-blue-50/50 space-y-4">

  <div>
    <h4 className="font-bold text-lg text-[#111C35]">
      Recruiter Evaluation
    </h4>
    <p className="text-sm text-slate-500 mt-1">
      Record your assessment of this applicant.
    </p>
  </div>

  {/* Rating */}
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">
      Applicant Rating
    </label>

    <select
      value={evaluationRating}
      onChange={(e) => setEvaluationRating(e.target.value)}
      className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="5">5 - Excellent</option>
      <option value="4">4 - Very Good</option>
      <option value="3">3 - Good</option>
      <option value="2">2 - Needs Improvement</option>
      <option value="1">1 - Poor</option>
    </select>
  </div>

  {/* Strengths */}
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">
      Applicant Strengths
    </label>

    <textarea
      value={evaluationStrengths}
      onChange={(e) => setEvaluationStrengths(e.target.value)}
      rows={3}
      placeholder={"Enter strengths, one per line...\nExample: Strong React knowledge"}
      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>

  {/* Weaknesses */}
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">
      Areas for Improvement
    </label>

    <textarea
      value={evaluationWeaknesses}
      onChange={(e) => setEvaluationWeaknesses(e.target.value)}
      rows={3}
      placeholder={"Enter improvement areas, one per line...\nExample: Limited backend experience"}
      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>

  {/* Notes */}
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">
      Recruiter Notes
    </label>

    <textarea
      value={evaluationNotes}
      onChange={(e) => setEvaluationNotes(e.target.value)}
      rows={3}
      placeholder="Add your assessment notes..."
      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>

  {/* Save */}
  <button
    type="button"
    onClick={handleSaveEvaluation}
    disabled={savingEvaluation}
    className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold text-sm hover:bg-blue-700 disabled:opacity-50"
  >
    {savingEvaluation ? "Saving Evaluation..." : "Save Evaluation"}
  </button>

  {selectedApplicant.recruiterEvaluation?.evaluatedAt && (
    <p className="text-xs text-slate-500 text-center">
      Last evaluated on{" "}
      {formatDate(selectedApplicant.recruiterEvaluation.evaluatedAt)}
    </p>
  )}

</div>


              {/* Close Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedApplicant(null)}
                  className="px-5 py-2.5 rounded-xl bg-[#111C35] text-white text-sm font-semibold hover:bg-slate-800"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default RecruiterApplicants;
