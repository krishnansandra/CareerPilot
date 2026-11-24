
import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  Users,
  UserCheck,
  ChartNoAxesCombined,
  Plus,
  Clock3,
} from "lucide-react";

import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { getRecruiterApplicants } from "../services/applicationService";
import { getRecruiterJobs } from "../services/jobService";
function RecruiterDashboard() {
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("careerpilot_token");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch applications and recruiter jobs together
        const [applicationsData, jobsData] = await Promise.all([
          getRecruiterApplicants(token),
        getRecruiterJobs(token),
        ]);

        setApplications(applicationsData.applications || []);
        setMyJobs(jobsData.jobs || []);
      } catch (error) {
        console.error("Dashboard loading error:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load dashboard information."
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    } else {
      setLoading(false);
      setError("Please log in again.");
    }
  }, [token]);

  // Calculate statistics
  const activeJobsCount = myJobs.filter(
    (job) => job.status === "Open"
  ).length;

  const totalApplicants = applications.length;

  const shortlistedCount = applications.filter(
    (application) => application.status === "Shortlisted"
  ).length;

  const hiredCount = applications.filter(
    (application) => application.status === "Hired"
  ).length;

  const stats = [
    {
      label: "Active Job Posts",
      value: activeJobsCount,
      icon: BriefcaseBusiness,
    },
    {
      label: "Total Applicants",
      value: totalApplicants,
      icon: Users,
    },
    {
      label: "Shortlisted",
      value: shortlistedCount,
      icon: UserCheck,
    },
    {
      label: "Hiring Activity",
      value: hiredCount > 0 ? `${hiredCount} Hired` : "In progress",
      icon: ChartNoAxesCombined,
    },
  ];

  return (
    <DashboardLayout
      title="Recruiter Workspace"
      subtitle="Manage your hiring activities and opportunities"
    >
      {/* Welcome Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-7 md:p-9">
        <div className="flex flex-col md:flex-row justify-between gap-5">
          <div>
            <span className="text-xs font-bold tracking-wider text-emerald-700">
              RECRUITER PORTAL
            </span>

            <h1 className="text-3xl font-bold text-[#111C35] mt-3">
              Welcome, {user?.name}
            </h1>

            <p className="text-slate-500 mt-3 max-w-xl leading-7">
              Create job opportunities, manage applications and connect
              with potential candidates through CareerPilot.
            </p>
          </div>

          <button
            type="button"
            disabled
            className="h-fit flex items-center justify-center gap-2 bg-emerald-700 text-white px-5 py-3 rounded-xl text-sm font-semibold opacity-70 cursor-not-allowed"
          >
            <Plus size={18} />
            Create Job (Coming soon)
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-7">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="bg-white border border-slate-200 rounded-2xl p-5"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Icon size={21} />
              </div>

              <p className="text-sm text-slate-500 mt-5">
                {stat.label}
              </p>

              <h3 className="text-xl font-bold text-[#111C35] mt-1">
                {loading ? "..." : stat.value}
              </h3>
            </div>
          );
        })}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-5 p-4 rounded-xl bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Hiring Overview */}
      <div className="grid lg:grid-cols-5 gap-6 mt-7">
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-[#111C35]">
            Hiring Overview
          </h3>

          <p className="text-sm text-slate-500 mt-2">
            Track your job postings and recruitment activity.
          </p>

          {loading ? (
            <div className="mt-7 py-10 text-center text-slate-500">
              Loading job postings...
            </div>
          ) : myJobs.length === 0 ? (
            <div className="mt-7 border border-dashed border-slate-300 rounded-xl p-8 text-center">
              <BriefcaseBusiness
                size={30}
                className="mx-auto text-slate-400"
              />

              <p className="font-semibold text-slate-700 mt-3">
                No job postings yet
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Your job listings will appear here once you create jobs.
              </p>
            </div>
          ) : (
            <div className="mt-7 space-y-4">
              {myJobs.map((job) => (
                <div
                  key={job._id}
                  className="border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-3"
                >
                  <div>
                    <h4 className="font-semibold text-[#111C35]">
                      {job.title}
                    </h4>

                    <p className="text-sm text-slate-500 mt-1">
                      {job.location} · {job.employmentType}
                    </p>
                  </div>

                  <span
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg h-fit ${
                      job.status === "Open"
                        ? "bg-green-50 text-green-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recruitment Workflow */}
        <div className="lg:col-span-2 bg-[#F0F7F4] border border-emerald-100 rounded-2xl p-6">
          <Clock3 size={25} className="text-emerald-700" />

          <h3 className="text-lg font-bold text-[#111C35] mt-4">
            Recruitment Workflow
          </h3>

          <div className="mt-5 space-y-4 text-sm text-slate-600">
            <p>01. Complete your company profile</p>
            <p>02. Create and publish job openings</p>
            <p>03. Review candidate applications</p>
            <p>04. Shortlist suitable candidates</p>
            <p>05. Complete the hiring process</p>
          </div>

          <p className="text-xs text-emerald-800 mt-6 font-semibold">
            Manage your job postings and track candidates from one workspace.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default RecruiterDashboard;
