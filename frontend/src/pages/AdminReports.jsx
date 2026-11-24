
import { useEffect, useState } from "react";

import {
  Users,
  UserRound,
  Building2,
  BriefcaseBusiness,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  BarChart3,
  AlertCircle,
} from "lucide-react";

import DashboardLayout from "../layouts/DashboardLayout";
import { getAdminReports } from "../services/adminReportsService";

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="mt-2 text-2xl font-bold text-gray-900">
          {value ?? 0}
        </h3>
      </div>

      <div className={`rounded-xl p-3 ${color}`}>
        <Icon size={23} />
      </div>
    </div>
  </div>
);

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const statusColors = {
  Applied: "bg-blue-100 text-blue-700",
  "Under Review": "bg-yellow-100 text-yellow-700",
  Shortlisted: "bg-purple-100 text-purple-700",
  Rejected: "bg-red-100 text-red-700",
  Hired: "bg-green-100 text-green-700",
  Open: "bg-green-100 text-green-700",
  Closed: "bg-red-100 text-red-700",
  Draft: "bg-gray-100 text-gray-700",
};

const AdminReports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminReports();

      if (!response.success) {
        throw new Error(response.message || "Unable to load reports");
      }

      setReports(response);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load admin reports"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Reports" subtitle="Platform analytics and insights">
        <div className="flex min-h-[300px] items-center justify-center">
          <RefreshCw className="animate-spin text-blue-600" size={30} />
          <span className="ml-3 text-gray-600">Loading reports...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Reports" subtitle="Platform analytics and insights">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-3 text-red-700">
            <AlertCircle size={22} />
            <p>{error}</p>
          </div>

          <button
            onClick={fetchReports}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const users = reports?.userStatistics || {};
  const recruiters = reports?.recruiterStatistics || {};
  const jobs = reports?.jobStatistics || {};
  const applications = reports?.applicationStatistics || {};
  const activity = reports?.recentActivity || {};

  const applicationBreakdown = applications.statusBreakdown || [];

  const maxApplications = Math.max(
    ...applicationBreakdown.map((item) => item.count),
    1
  );

  return (
    <DashboardLayout
      title="Reports & Analytics"
      subtitle="Monitor CareerPilot platform performance"
    >
      <div className="space-y-8">

        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Platform Overview
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Live statistics and activity from CareerPilot.
            </p>
          </div>

          <button
            onClick={fetchReports}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            Refresh Reports
          </button>
        </div>

        {/* User Statistics */}
        <section>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            User Statistics
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Users"
              value={users.totalUsers}
              icon={Users}
              color="bg-blue-100 text-blue-600"
            />

            <StatCard
              title="Students"
              value={users.totalStudents}
              icon={UserRound}
              color="bg-purple-100 text-purple-600"
            />

            <StatCard
              title="Recruiters"
              value={users.totalRecruiters}
              icon={Building2}
              color="bg-orange-100 text-orange-600"
            />

            <StatCard
              title="Active Users"
              value={users.activeUsers}
              icon={CheckCircle2}
              color="bg-green-100 text-green-600"
            />
          </div>
        </section>

        {/* Recruiter Statistics */}
        <section>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Recruiter Verification
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              title="Verified Recruiters"
              value={recruiters.verifiedRecruiters}
              icon={CheckCircle2}
              color="bg-green-100 text-green-600"
            />

            <StatCard
              title="Pending Verification"
              value={recruiters.pendingRecruiters}
              icon={Clock}
              color="bg-yellow-100 text-yellow-600"
            />

            <StatCard
              title="Rejected Recruiters"
              value={recruiters.rejectedRecruiters}
              icon={XCircle}
              color="bg-red-100 text-red-600"
            />
          </div>
        </section>

        {/* Job Statistics */}
        <section>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Job Statistics
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Jobs"
              value={jobs.totalJobs}
              icon={BriefcaseBusiness}
              color="bg-blue-100 text-blue-600"
            />

            <StatCard
              title="Open Jobs"
              value={jobs.openJobs}
              icon={CheckCircle2}
              color="bg-green-100 text-green-600"
            />

            <StatCard
              title="Closed Jobs"
              value={jobs.closedJobs}
              icon={XCircle}
              color="bg-red-100 text-red-600"
            />

            <StatCard
              title="Draft Jobs"
              value={jobs.draftJobs}
              icon={FileText}
              color="bg-gray-100 text-gray-600"
            />
          </div>
        </section>

        {/* Application Statistics */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-100 p-3 text-indigo-600">
                <FileText size={22} />
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Total Applications
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {applications.totalApplications ?? 0}
                </h3>
              </div>
            </div>

            <h4 className="mb-5 mt-7 font-semibold text-gray-900">
              Application Status Breakdown
            </h4>

            <div className="space-y-5">
              {applicationBreakdown.map((item) => {
                const percentage =
                  applications.totalApplications > 0
                    ? (item.count / applications.totalApplications) * 100
                    : 0;

                return (
                  <div key={item.status}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="font-medium text-gray-700">
                        {item.status}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {item.count}
                      </span>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Platform Summary */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                <BarChart3 size={22} />
              </div>

              <h3 className="font-semibold text-gray-900">
                Platform Summary
              </h3>
            </div>

            <div className="space-y-5">
              {[
                ["Total Registered Users", users.totalUsers],
                ["Active Accounts", users.activeUsers],
                ["Total Recruiters", users.totalRecruiters],
                ["Total Job Postings", jobs.totalJobs],
                ["Total Applications", applications.totalApplications],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between border-b border-gray-100 pb-3"
                >
                  <span className="text-sm text-gray-600">{label}</span>
                  <span className="font-bold text-gray-900">
                    {value ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">

          {/* Recent Users */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900">
                Recently Registered Users
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Latest accounts created on the platform
              </p>
            </div>

            <div className="divide-y divide-gray-100">
              {activity.recentUsers?.length > 0 ? (
                activity.recentUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex flex-wrap items-center justify-between gap-3 p-4"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {user.email}
                      </p>
                      <span className="mt-1 inline-block rounded-full bg-blue-50 px-2 py-1 text-xs capitalize text-blue-700">
                        {user.role}
                      </span>
                    </div>

                    <span className="text-xs text-gray-500">
                      {formatDate(user.createdAt)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="p-5 text-sm text-gray-500">
                  No users found.
                </p>
              )}
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900">
                Recently Posted Jobs
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Latest job postings by recruiters
              </p>
            </div>

            <div className="divide-y divide-gray-100">
              {activity.recentJobs?.length > 0 ? (
                activity.recentJobs.map((job) => (
                  <div
                    key={job._id}
                    className="flex flex-wrap items-center justify-between gap-3 p-4"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {job.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {job.companyName}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {job.location || "Location not specified"}
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          statusColors[job.status] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {job.status}
                      </span>
                      <p className="mt-2 text-xs text-gray-500">
                        {formatDate(job.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="p-5 text-sm text-gray-500">
                  No job postings found.
                </p>
              )}
            </div>
          </div>
        </section>

      </div>
    </DashboardLayout>
  );
};

export default AdminReports;
