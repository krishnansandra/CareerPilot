
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getRecruiterJobById,
  updateJob,
} from "../services/jobService";

function EditJob() {
  const { id } = useParams();
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await getRecruiterJobById(id, token);
        const job = response.job;

        setFormData({
          title: job.title || "",
          description: job.description || "",
          requiredSkills: (job.requiredSkills || []).join(", "),
          responsibilities: (job.responsibilities || []).join("\n"),
          qualifications: (job.qualifications || []).join("\n"),
          employmentType: job.employmentType || "Full-time",
          workplaceType: job.workplaceType || "On-site",
          location: job.location || "",
          experienceLevel: job.experienceLevel || "Fresher",
          salaryMin: job.salary?.min ?? "",
          salaryMax: job.salary?.max ?? "",
          vacancies: job.vacancies || 1,
          applicationDeadline: job.applicationDeadline
            ? new Date(job.applicationDeadline).toISOString().split("T")[0]
            : "",
          status: job.status || "Open",
        });
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load job details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id && token) {
      fetchJob();
    }
  }, [id, token]);

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
      setSaving(true);

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

      await updateJob(id, jobData, token);

      setSuccess("Job updated successfully!");

      setTimeout(() => {
        navigate("/recruiter/jobs");
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update job."
      );
    } finally {
      setSaving(false);
    }
  };

  const inputStyle =
    "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const labelStyle = "mb-2 block text-sm font-medium text-slate-700";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Loading job details...
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => navigate("/recruiter/jobs")}
          className="mt-4 text-blue-600"
        >
          Back to Manage Jobs
        </button>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-slate-800">
            Edit Job
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Update the job details and save your changes.
          </p>
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
                  required
                />
              </div>

              <div>
                <label className={labelStyle}>Job Description *</label>
                <textarea
                  className={inputStyle}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
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
                  rows={3}
                />
              </div>

              <div>
                <label className={labelStyle}>Responsibilities</label>
                <textarea
                  className={inputStyle}
                  name="responsibilities"
                  value={formData.responsibilities}
                  onChange={handleChange}
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
                <label className={labelStyle}>Employment Type</label>
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
                <label className={labelStyle}>Workplace Type</label>
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
                <label className={labelStyle}>Location</label>
                <input
                  className={inputStyle}
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className={labelStyle}>Vacancies</label>
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
              Salary Details (INR)
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelStyle}>Minimum Salary</label>
                <input
                  className={inputStyle}
                  type="number"
                  name="salaryMin"
                  min="0"
                  value={formData.salaryMin}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className={labelStyle}>Maximum Salary</label>
                <input
                  className={inputStyle}
                  type="number"
                  name="salaryMax"
                  min="0"
                  value={formData.salaryMax}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          <section>
            <h2 className="mb-5 text-lg font-semibold text-slate-800">
              Publishing Settings
            </h2>

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
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditJob;
