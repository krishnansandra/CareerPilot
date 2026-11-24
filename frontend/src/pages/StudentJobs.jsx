
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  BriefcaseBusiness,
  Clock,
  Building2,
  SlidersHorizontal,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { getStudentJobs } from "../services/studentJobService";

function StudentJobs() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    employmentType: "",
    workplaceType: "",
    location: "",
    experienceLevel: "",
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  const fetchJobs = async (currentFilters, currentPage) => {
    try {
      setLoading(true);
      setError("");

      const response = await getStudentJobs(
        {
          ...currentFilters,
          page: currentPage,
          limit: 10,
        },
        token
      );

      setJobs(response.jobs || []);
      setTotalJobs(response.totalJobs || 0);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load available jobs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchJobs(appliedFilters, page);
    }
  }, [token, appliedFilters, page]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setAppliedFilters({ ...filters });
  };

  const handleReset = () => {
    const emptyFilters = {
      search: "",
      employmentType: "",
      workplaceType: "",
      location: "",
      experienceLevel: "",
    };

    setFilters(emptyFilters);
    setPage(1);
    setAppliedFilters(emptyFilters);
  };

  const inputStyle =
    "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <div className="min-h-screen bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold text-blue-600">
            CAREERPILOT JOB DISCOVERY
          </p>

          <h1 className="text-3xl font-bold text-slate-800">
            Find Your Next Opportunity
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Explore opportunities that match your skills and career goals.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"
        >
          <div className="mb-5 flex items-center gap-2">
            <SlidersHorizontal size={19} className="text-blue-600" />
            <h2 className="font-semibold text-slate-800">
              Search and Filter Jobs
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Search Jobs
              </label>

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  className={`${inputStyle} pl-11`}
                  name="search"
                  value={filters.search}
                  onChange={handleChange}
                  placeholder="Job title, company or skills..."
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Location
              </label>

              <input
                className={inputStyle}
                name="location"
                value={filters.location}
                onChange={handleChange}
                placeholder="Enter location"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Employment Type
              </label>

              <select
                className={inputStyle}
                name="employmentType"
                value={filters.employmentType}
                onChange={handleChange}
              >
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Workplace Type
              </label>

              <select
                className={inputStyle}
                name="workplaceType"
                value={filters.workplaceType}
                onChange={handleChange}
              >
                <option value="">All Workplaces</option>
                <option value="Remote">Remote</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Experience Level
              </label>

              <select
                className={inputStyle}
                name="experienceLevel"
                value={filters.experienceLevel}
                onChange={handleChange}
              >
                <option value="">All Experience Levels</option>
                <option value="Fresher">Fresher</option>
                <option value="0-1 years">0-1 years</option>
                <option value="1-3 years">1-3 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5+ years">5+ years</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Search size={17} />
              Search Jobs
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Reset Filters
            </button>
          </div>
        </form>

        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Available Opportunities
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {totalJobs} open job{totalJobs !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl bg-white p-12 text-center text-slate-500">
            Loading available jobs...
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 p-6 text-center text-red-600">
            {error}
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <BriefcaseBusiness
              size={40}
              className="mx-auto mb-4 text-slate-300"
            />

            <h3 className="text-lg font-semibold text-slate-700">
              No Jobs Found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try changing your search terms or filters.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                      <Building2 size={24} />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-800">
                        {job.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {job.companyName}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                    {job.status}
                  </span>
                </div>

                <p className="mb-4 line-clamp-3 text-sm leading-6 text-slate-600">
                  {job.description}
                </p>

                <div className="mb-4 flex flex-wrap gap-2">
                  {job.requiredSkills?.slice(0, 5).map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-md bg-slate-100 px-3 py-1.5 text-xs text-slate-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500">
                  <span className="flex items-center gap-2">
                    <BriefcaseBusiness size={15} />
                    {job.employmentType}
                  </span>

                  <span className="flex items-center gap-2">
                    <MapPin size={15} />
                    {job.location || job.workplaceType}
                  </span>

                  <span className="flex items-center gap-2">
                    <Clock size={15} />
                    {job.experienceLevel}
                  </span>

                  <span>
                    {job.workplaceType}
                  </span>
                </div>

                <div className="mt-5">
                  <button
                    onClick={() =>
                      navigate(`/student/jobs/${job._id}`)
                    }
                    className="w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    View Job Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              disabled={page <= 1}
              onClick={() => setPage((prev) => prev - 1)}
              className="rounded-lg border border-slate-300 px-5 py-2 text-sm disabled:opacity-40"
            >
              Previous
            </button>

            <span className="text-sm text-slate-600">
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className="rounded-lg border border-slate-300 px-5 py-2 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentJobs;
