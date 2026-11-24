
import { useEffect, useState } from "react";
import {
  Users,
  BriefcaseBusiness,
  Building2,
  ShieldCheck,
  Activity,
  ClipboardList,
  GraduationCap,
} from "lucide-react";

import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { getAdminDashboardStats } from "../services/adminService";

function AdminDashboard() {
  const { user } = useAuth();

  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalRecruiters: 0,
    totalJobs: 0,
    pendingRecruiters: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("careerpilot_token");

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminDashboardStats(token);
      setStatsData(data.stats);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load dashboard statistics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const stats = [
    {
      label: "Registered Users",
      value: statsData.totalUsers,
      icon: Users,
    },
    {
      label: "Students",
      value: statsData.totalStudents,
      icon: GraduationCap,
    },
    {
      label: "Recruiters",
      value: statsData.totalRecruiters,
      icon: Building2,
    },
    {
      label: "Job Listings",
      value: statsData.totalJobs,
      icon: BriefcaseBusiness,
    },
    {
      label: "Pending Reviews",
      value: statsData.pendingRecruiters,
      icon: ShieldCheck,
    },
  ];

  return (
    <DashboardLayout
      title="Administration"
      subtitle="Platform overview and management workspace"
    >
      <div className="bg-[#17243D] rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 text-blue-300">
          <ShieldCheck size={22} />
          <span className="text-xs font-bold tracking-wider">
            ADMIN CONTROL CENTER
          </span>
        </div>

        <h1 className="text-3xl font-bold mt-4">
          Welcome, {user?.name}
        </h1>

        <p className="text-slate-300 mt-3 max-w-2xl leading-7">
          Monitor CareerPilot activity, oversee accounts and maintain
          a reliable career platform for students and recruiters.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-xl bg-red-50 text-red-700 p-4 text-sm">
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 mt-7">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="bg-white border border-slate-200 rounded-2xl p-5"
            >
              <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center">
                <Icon size={21} />
              </div>

              <p className="text-sm text-slate-500 mt-5">
                {stat.label}
              </p>

              <h3 className="text-2xl font-bold text-[#111C35] mt-1">
                {loading ? "..." : stat.value}
              </h3>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-7">
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Activity className="text-violet-600" size={23} />
            <h3 className="text-lg font-bold text-[#111C35]">
              Platform activity
            </h3>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Total students</span>
              <span className="font-semibold text-[#111C35]">
                {loading ? "..." : statsData.totalStudents}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Total recruiters</span>
              <span className="font-semibold text-[#111C35]">
                {loading ? "..." : statsData.totalRecruiters}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Published job listings</span>
              <span className="font-semibold text-[#111C35]">
                {loading ? "..." : statsData.totalJobs}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <ClipboardList className="text-violet-600" size={23} />
            <h3 className="text-lg font-bold text-[#111C35]">
              Administration tasks
            </h3>
          </div>

          <div className="mt-6 space-y-4 text-sm text-slate-600">
            <p>Review and manage user accounts</p>
            <p>Verify recruiter profiles</p>
            <p>Monitor published job listings</p>
            <p>Review platform reports</p>
          </div>

          <p className="text-xs text-violet-700 font-semibold mt-6">
            CareerPilot administration workspace
          </p>
        </div>
      </div>

      <button
        onClick={fetchStats}
        disabled={loading}
        className="mt-6 px-5 py-2.5 rounded-xl bg-[#17243D] text-white text-sm font-semibold hover:bg-[#253653] disabled:opacity-50"
      >
        {loading ? "Loading..." : "Refresh Statistics"}
      </button>
    </DashboardLayout>
  );
}

export default AdminDashboard;
