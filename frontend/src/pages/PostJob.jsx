
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BriefcaseBusiness, PlusCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { createJob } from "../services/jobService";

function PostJob() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requiredSkills: "",
    responsibilities: "",
    qualifications: "",
    employmentType: "Full-time",
    workplaceType: "On-site",
    location: "",
    experienceLevel: "Fresher",
    salaryMin: "",
    salaryMax: "",
    vacancies: 1,
    applicationDeadline: "",
    status: "Open",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const convertToArray = (value) =>
    value
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Post Job button clicked!");
console.log("Form Data:", formData);
    setError("");
    setSuccess("");

    if (
      formData.salaryMin !== "" &&
      formData.salaryMax !== "" &&
      Number(formData.salaryMin) > Number(formData.salaryMax)
    ) {
      setError("Minimum salary cannot exceed maximum salary.");
      return;
    }

    try {
      setLoading(true);

      const jobData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        requiredSkills: convertToArray(formData.requiredSkills),
        responsibilities: convertToArray(formData.responsibilities),
        qualifications: convertToArray(formData.qualifications),
        employmentType: formData.employmentType,
        workplaceType: formData.workplaceType,
        location: formData.location.trim(),
        experienceLevel: formData.experienceLevel,
        vacancies: Number(formData.vacancies),
        status: formData.status,
      };

      if (formData.salaryMin !== "" || formData.salaryMax !== "") {
        jobData.salary = {
          min: formData.salaryMin === "" ? undefined : Number(formData.salaryMin),
          max: formData.salaryMax === "" ? undefined : Number(formData.salaryMax),
          currency: "INR",
        };
      }

      if (formData.applicationDeadline) {
        jobData.applicationDeadline = formData.applicationDeadline;
      }

      await createJob(jobData, token);

      setSuccess("Job posted successfully!");

      setTimeout(() => {
        navigate("/recruiter/jobs");
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to post the job. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const labelStyle = "mb-2 block text-sm font-medium text-slate-700";

  return (
    <div className="min-h-screen bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-4xl">

        <button
          type="button"
          onClick={() => navigate("/recruiter/jobs")}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600"
        >
          <ArrowLeft size={18} />
          Back to Manage Jobs
        </button>

        <div className="mb-7">
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
              <BriefcaseBusiness size={25} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Post a New Job
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Find the right candidates for your company.
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
        >
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <section>
            <h2 className="mb-5 text-lg font-semibold text-slate-800">
              Basic Job Information
            </h2>

            <div className="space-y-5">
              <div>
                <label className={labelStyle}>Job Title *</label>
                <input
                  className={inputStyle}
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Junior React Developer"
                  required
                  maxLength={100}
                />
              </div>

              <div>
                <label className={labelStyle}>Job Description *</label>
                <textarea
                  className={inputStyle}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the role and what the candidate will do..."
                  rows={5}
                  required
                />
              </div>

              <div>
                <label className={labelStyle}>Required Skills</label>
                <textarea
                  className={inputStyle}
                  name="requiredSkills"
                  value={formData.requiredSkills}
                  onChange={handleChange}
                  placeholder="React, JavaScript, HTML, CSS, Git"
                  rows={3}
                />
                <p className="mt-1 text-xs text-slate-400">
                  Separate skills using commas or new lines.
                </p>
              </div>

              <div>
                <label className={labelStyle}>Responsibilities</label>
                <textarea
                  className={inputStyle}
                  name="responsibilities"
                  value={formData.responsibilities}
                  onChange={handleChange}
                  placeholder="Develop UI components, integrate APIs..."
                  rows={3}
                />
              </div>

              <div>
                <label className={labelStyle}>Qualifications</label>
                <textarea
                  className={inputStyle}
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleChange}
                  placeholder="Bachelor's degree, knowledge of React..."
                  rows={3}
                />
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          <section>
            <h2 className="mb-5 text-lg font-semibold text-slate-800">
              Job Requirements
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelStyle}>Employment Type *</label>
                <select
                  className={inputStyle}
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Internship</option>
                  <option>Contract</option>
                </select>
              </div>

              <div>
                <label className={labelStyle}>Workplace Type *</label>
                <select
                  className={inputStyle}
                  name="workplaceType"
                  value={formData.workplaceType}
                  onChange={handleChange}
                >
                  <option>On-site</option>
                  <option>Remote</option>
                  <option>Hybrid</option>
                </select>
              </div>

              <div>
                <label className={labelStyle}>Experience Level</label>
                <select
                  className={inputStyle}
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                >
                  <option>Fresher</option>
                  <option>0-1 years</option>
                  <option>1-3 years</option>
                  <option>3-5 years</option>
                  <option>5+ years</option>
                </select>
              </div>

              <div>
                <label className={labelStyle}>Job Location</label>
                <input
                  className={inputStyle}
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Kochi or Remote"
                />
              </div>

              <div>
                <label className={labelStyle}>Number of Vacancies</label>
                <input
                  className={inputStyle}
                  type="number"
                  name="vacancies"
                  min="1"
                  value={formData.vacancies}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className={labelStyle}>Application Deadline</label>
                <input
                  className={inputStyle}
                  type="date"
                  name="applicationDeadline"
                  value={formData.applicationDeadline}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          <section>
            <h2 className="mb-5 text-lg font-semibold text-slate-800">
              Salary Details
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelStyle}>Minimum Salary (INR)</label>
                <input
                  className={inputStyle}
                  type="number"
                  name="salaryMin"
                  min="0"
                  value={formData.salaryMin}
                  onChange={handleChange}
                  placeholder="e.g. 200000"
                />
              </div>

              <div>
                <label className={labelStyle}>Maximum Salary (INR)</label>
                <input
                  className={inputStyle}
                  type="number"
                  name="salaryMax"
                  min="0"
                  value={formData.salaryMax}
                  onChange={handleChange}
                  placeholder="e.g. 400000"
                />
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          <section>
            <h2 className="mb-5 text-lg font-semibold text-slate-800">
              Publishing Settings
            </h2>

            <div>
              <label className={labelStyle}>Job Status</label>
              <select
                className={inputStyle}
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Open">Open</option>
                <option value="Draft">Draft</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </section>

          <div className="flex flex-col justify-end gap-3 border-t border-slate-100 pt-6 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/recruiter/jobs")}
              className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <PlusCircle size={18} />
              {loading ? "Posting..." : "Post Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostJob;
