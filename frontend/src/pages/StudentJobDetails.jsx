
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Briefcase, Clock, CalendarDays } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { getStudentJobById } from "../services/studentJobService";
import { applyForJob } from "../services/applicationService";

function StudentJobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
const [applying, setApplying] = useState(false);
const [applicationMessage, setApplicationMessage] = useState("");
const [applicationError, setApplicationError] = useState("");
const [applicationSubmitted, setApplicationSubmitted] = useState(false);

const handleApply = async () => {
  try {
    setApplying(true);
    setApplicationError("");
    setApplicationMessage("");

    const response = await applyForJob(
      id,
      { coverLetter },
      token
    );

    setApplicationMessage(response.message);
    setApplicationSubmitted(true);
  } catch (error) {
    setApplicationError(
      error.response?.data?.message ||
      "Unable to submit your application."
    );
  } finally {
    setApplying(false);
  }
};

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getStudentJobById(id, token);
        setJob(response.job);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load job details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id && token) {
      fetchJobDetails();
    }
  }, [id, token]);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Loading job details...
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-sm">
        <p className="text-red-600">
          {error || "Job not found."}
        </p>
        <button
          onClick={() => navigate("/student/jobs")}
          className="mt-4 rounded-lg bg-blue-700 px-5 py-2 text-white"
        >
          Back to Jobs
        </button>
      </div>
    );
  }

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "Not specified";

  const formatSalary = () => {
    if (!job.salary?.min && !job.salary?.max) {
      return "Not disclosed";
    }

    const currency = job.salary.currency || "INR";
    const min = job.salary.min;
    const max = job.salary.max;

    if (min && max) {
      return `${currency} ${min.toLocaleString("en-IN")} - ${max.toLocaleString("en-IN")}`;
    }

    return `${currency} ${(min || max).toLocaleString("en-IN")}`;
  };

  const DetailSection = ({ title, items }) => {
    if (!items || items.length === 0) return null;

    return (
      <section className="border-t border-slate-100 pt-6">
        <h2 className="mb-3 text-lg font-semibold text-slate-800">
          {title}
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-slate-600">
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>
    );
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <button
        onClick={() => navigate("/student/jobs")}
        className="flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900"
      >
        <ArrowLeft size={18} />
        Back to Jobs
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row">
          <div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {job.status}
            </span>

            <h1 className="mt-4 text-2xl font-bold text-slate-900 md:text-3xl">
              {job.title}
            </h1>

            <p className="mt-2 text-lg font-medium text-slate-600">
              {job.companyName}
            </p>

            <p className="mt-3 text-sm text-slate-500">
              Posted by {job.recruiter?.name || "Recruiter"}
            </p>
          </div>

          <div className="flex flex-wrap items-start gap-2">
            <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
              {job.employmentType}
            </span>
            <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
              {job.workplaceType}
            </span>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-4 border-y border-slate-100 py-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center gap-3">
            <MapPin className="text-blue-600" size={20} />
            <div>
              <p className="text-xs text-slate-500">Location</p>
              <p className="text-sm font-medium text-slate-800">
                {job.location || "Not specified"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Briefcase className="text-blue-600" size={20} />
            <div>
              <p className="text-xs text-slate-500">Experience</p>
              <p className="text-sm font-medium text-slate-800">
                {job.experienceLevel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="text-blue-600" size={20} />
            <div>
              <p className="text-xs text-slate-500">Salary</p>
              <p className="text-sm font-medium text-slate-800">
                {formatSalary()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CalendarDays className="text-blue-600" size={20} />
            <div>
              <p className="text-xs text-slate-500">Application Deadline</p>
              <p className="text-sm font-medium text-slate-800">
                {formatDate(job.applicationDeadline)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Briefcase className="text-blue-600" size={20} />
            <div>
              <p className="text-xs text-slate-500">Vacancies</p>
              <p className="text-sm font-medium text-slate-800">
                {job.vacancies || 1}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-7 pt-6">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-800">
              Job Description
            </h2>
            <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
              {job.description}
            </p>
          </section>

          <DetailSection title="Required Skills" items={job.requiredSkills} />
          <DetailSection title="Responsibilities" items={job.responsibilities} />
          <DetailSection title="Qualifications" items={job.qualifications} />
        </div>

        
<div className="mt-8 border-t border-slate-100 pt-6">
  <h2 className="mb-3 text-lg font-semibold text-slate-800">
    Apply for this Position
  </h2>

  <label className="mb-2 block text-sm font-medium text-slate-700">
    Cover Letter (Optional)
  </label>

  <textarea
    value={coverLetter}
    onChange={(e) => setCoverLetter(e.target.value)}
    placeholder="Tell the recruiter why you are interested in this opportunity..."
    rows={5}
    maxLength={2000}
    disabled={applicationSubmitted}
    className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
  />

  {applicationError && (
    <p className="mt-3 text-sm text-red-600">
      {applicationError}
    </p>
  )}

  {applicationMessage && (
    <p className="mt-3 text-sm text-green-600">
      {applicationMessage}
    </p>
  )}

  <button
    onClick={handleApply}
    disabled={applying || applicationSubmitted}
    className="mt-5 rounded-lg bg-blue-700 px-7 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {applying
      ? "Submitting..."
      : applicationSubmitted
      ? "Application Submitted"
      : "Apply for this Job"}
  </button>
</div>

      </div>
    </div>
  );
}

export default StudentJobDetails;
