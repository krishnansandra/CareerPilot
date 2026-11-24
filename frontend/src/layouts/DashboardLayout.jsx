
import { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  UserRound,
  BriefcaseBusiness,
  FileText,
  LogOut,
  Sparkles,
  Users,
  ClipboardList,
  Building2,
  GraduationCap,
  MessageSquare,
  Bell,
    History,
      CalendarDays,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { getMyNotifications } from "../services/notificationService";

const navigation = {
  student: [
    {
      label: "Overview",
      path: "/student/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "My Profile",
      path: "/student/profile",
      icon: UserRound,
    },
    {
      label: "Find Jobs",
      path: "/student/jobs",
      icon: BriefcaseBusiness,
    },
    {
      label: "My Resume",
      path: "/student/resume",
      icon: FileText,
    },
    {
      label: "My Applications",
      path: "/student/applications",
      icon: BriefcaseBusiness,
    },
    {
      label: "Skill Roadmap",
      path: "/student/skill-roadmap",
      icon: GraduationCap,
    },
    {
      label: "Interview Preparation",
      path: "/student/interview-preparation",
      icon: MessageSquare,
    },
    {
      label: "Notifications",
      path: "/student/notifications",
      icon: Bell,
    },
    {
  label: "Resume Builder",
  path: "/student/resume-builder",
  icon: FileText,
},
{
  label: "Interview History",
  path: "/student/interview-history",
  icon: History,
},
{
  label: "Interview Invitations",
  path: "/student/interviews",
  icon: CalendarDays,
},
  ],

  recruiter: [
    {
      label: "Overview",
      path: "/recruiter/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Company Profile",
      path: "/recruiter/profile",
      icon: UserRound,
    },
    {
      label: "Manage Jobs",
      path: "/recruiter/jobs",
      icon: BriefcaseBusiness,
    },
    {
      label: "Applicants",
      path: "/recruiter/applicants",
      icon: Users,
    },
    {
  label: "Interview Management",
  path: "/recruiter/interviews",
  icon: CalendarDays,
},
  ],

  admin: [
    {
      label: "Overview",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: Users,
    },
    {
      label: "Job Management",
      path: "/admin/jobs",
      icon: BriefcaseBusiness,
    },
    {
      label: "Reports",
      path: "/admin/reports",
      icon: ClipboardList,
    },
    {
      label: "Recruiter Management",
      path: "/admin/recruiters",
      icon: Building2,
    },
  ],
};

function DashboardLayout({ children, title, subtitle }) {
  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const role = user?.role || "student";
  const items = navigation[role] || navigation.student;

  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notification count
  useEffect(() => {
    if (role !== "student") {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem("careerpilot_token");

        if (!token) return;

        const data = await getMyNotifications(token);

        setUnreadCount(data.unreadCount || 0);
      } catch (error) {
        console.error(
          "Unable to fetch notification count:",
          error
        );
      }
    };

    fetchUnreadCount();

    // Refresh notification count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [role, location.pathname]);

  // Logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex">

      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#111C35] text-white flex-col fixed inset-y-0 left-0 z-40">

        {/* Logo */}
        <div className="px-7 py-7 border-b border-white/10">
          <h1 className="text-2xl font-bold">
            Career<span className="text-blue-400">Pilot</span>
          </h1>

          <p className="text-xs text-slate-400 mt-1">
            Career management workspace
          </p>
        </div>

        {/* Navigation */}
        <div className="px-5 py-6 flex-1 overflow-y-auto">

          <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-4">
            Workspace
          </p>

          <nav className="space-y-2">

            {items.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <Icon size={19} />

                  <span className="flex-1">
                    {item.label}
                  </span>

                  {item.label === "Notifications" &&
                    unreadCount > 0 && (
                      <span className="min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                        {unreadCount > 99
                          ? "99+"
                          : unreadCount}
                      </span>
                    )}
                </NavLink>
              );
            })}

          </nav>
        </div>

        {/* User Profile and Sign Out */}
        <div className="p-5 border-t border-white/10">

          <div className="flex items-center gap-3 mb-5">

            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="min-w-0">
              <p className="font-medium text-sm truncate">
                {user?.name}
              </p>

              <p className="text-xs text-slate-400 capitalize">
                {role}
              </p>
            </div>

          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition"
          >
            <LogOut size={18} />
            Sign out
          </button>

        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-w-0">

        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 md:px-10 py-5 flex items-center justify-between">

          <div>
            <h2 className="text-xl font-bold text-[#111C35]">
              {title}
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">

            <div className="hidden sm:flex items-center gap-2 bg-blue-50 text-blue-700 rounded-full px-3 py-2 text-xs font-medium">
              <Sparkles size={15} />
              AI Career Assistant
            </div>

            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {children}
        </div>

      </main>
    </div>
  );
}

export default DashboardLayout;
