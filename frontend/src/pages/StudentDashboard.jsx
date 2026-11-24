
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  FileText,
  BriefcaseBusiness,
  Target,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  CheckCircle,
} from "lucide-react";

import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";

import { getMyResume } from "../services/resumeService";
import { getMyApplications } from "../services/applicationService";
import { getStudentProfile } from "../services/studentProfileService";

function StudentDashboard() {
  const { user, token } = useAuth();

  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [applicationCount, setApplicationCount] = useState(0);
  const [profileCompletion, setProfileCompletion] = useState(0);

  const [resumeLoading, setResumeLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  // Check whether a field contains meaningful data
  const hasValue = (value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    if (typeof value === "string") {
      return value.trim().length > 0;
    }

    return Boolean(value);
  };

  // Calculate profile completion
  const calculateProfileCompletion = (profile) => {
    if (!profile) {
      return 0;
    }

    const completedSections = [
      hasValue(profile.phone),
      hasValue(profile.location),
      hasValue(profile.professionalSummary),
      hasValue(profile.education),
      hasValue(profile.skills),
      hasValue(profile.experience),
      hasValue(profile.projects),
      hasValue(profile.careerInterests),
      hasValue(profile.preferredJobRoles),
      hasValue(profile.linkedinUrl) ||
        hasValue(profile.githubUrl) ||
        hasValue(profile.portfolioUrl),
    ];

    const completedCount = completedSections.filter(Boolean).length;

    return completedCount * 10;
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const results = await Promise.allSettled([
          getMyResume(token),
          getMyApplications(token),
          getStudentProfile(token),
        ]);

        // Resume status
        if (results[0].status === "fulfilled") {
          setResumeUploaded(
            Boolean(results[0].value.resume)
          );
        } else {
          console.error("Resume fetch failed:", results[0].reason);
        }

        // Application count
        if (results[1].status === "fulfilled") {
          setApplicationCount(
            results[1].value.applications?.length || 0
          );
        } else {
          console.error(
            "Application fetch failed:",
            results[1].reason
          );
        }

        // Profile completion
        if (results[2].status === "fulfilled") {
          const profile = results[2].value.profile;

          setProfileCompletion(
            calculateProfileCompletion(profile)
          );
        } else {
          console.error("Profile fetch failed:", results[2].reason);
        }
      } finally {
        setResumeLoading(false);
        setApplicationsLoading(false);
        setProfileLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    } else {
      setResumeLoading(false);
      setApplicationsLoading(false);
      setProfileLoading(false);
    }
  }, [token]);

  // Career progress
  const careerProgress = !resumeUploaded
    ? "Getting started"
    : applicationCount === 0
    ? "Resume ready"
    : applicationCount < 3
    ? "Exploring opportunities"
    : "Actively applying";

  // Dashboard statistics
  const stats = [
    {
      label: "Profile Completion",
      value: profileLoading
        ? "Loading..."
        : `${profileCompletion}%`,
      icon: Target,
    },
    {
      label: "Resume Status",
      value: resumeLoading
        ? "Checking..."
        : resumeUploaded
        ? "Uploaded"
        : "Not uploaded",
      icon: FileText,
    },
    {
      label: "Job Applications",
      value: applicationsLoading
        ? "Loading..."
        : applicationCount.toString(),
      icon: BriefcaseBusiness,
    },
    {
      label: "Career Progress",
      value:
        resumeLoading || applicationsLoading
          ? "Loading..."
          : careerProgress,
      icon: TrendingUp,
    },
  ];

  return (
    <DashboardLayout
      title="Student Dashboard"
      subtitle="Your personal career development workspace"
    >
      {/* Welcome Section */}
      <div className="bg-[#111C35] rounded-2xl p-7 md:p-9 text-white">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div>
            <p className="text-blue-300 text-sm font-medium">
              YOUR CAREER JOURNEY STARTS HERE
            </p>

            <h1 className="text-3xl font-bold mt-3">
              Welcome, {user?.name}!
            </h1>

            <p className="text-slate-300 mt-3 max-w-xl leading-7">
              Build your profile, upload your resume and discover
              opportunities that match your career goals.
            </p>
          </div>

          <div className="hidden md:flex w-20 h-20 rounded-2xl bg-white/10 items-center justify-center">
            <Sparkles size={38} className="text-blue-300" />
          </div>
        </div>
      </div>

      {/* Dashboard Statistics */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-7">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="bg-white border border-slate-200 rounded-2xl p-5"
            >
              <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Icon size={21} />
              </div>

              <p className="text-sm text-slate-500 mt-5">
                {stat.label}
              </p>

              <h3
                className={`text-xl font-bold mt-1 ${
                  stat.label === "Resume Status" && resumeUploaded
                    ? "text-green-600"
                    : "text-[#111C35]"
                }`}
              >
                {stat.value}
              </h3>
            </div>
          );
        })}
      </div>

      {/* Main Dashboard Content */}
      <div className="grid lg:grid-cols-3 gap-6 mt-7">

        {/* Getting Started */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-[#111C35]">
            Get started with CareerPilot
          </h3>

          <p className="text-sm text-slate-500 mt-2">
            Complete these steps to make the most of your career workspace.
          </p>

          <div className="mt-6 space-y-5">

            {/* Profile */}
            <div className="flex gap-4">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center">
                01
              </div>

              <div>
                <h4 className="font-semibold text-slate-800">
                  Complete your profile
                </h4>

                <p className="text-sm text-slate-500 mt-1">
                  Your profile is currently{" "}
                  {profileLoading ? "being checked" : `${profileCompletion}% complete`}.
                  Add your education, skills and career interests.
                </p>

                <Link
                  to="/student/profile"
                  className="inline-block text-sm text-blue-600 font-semibold mt-2 hover:underline"
                >
                  Complete Profile →
                </Link>
              </div>
            </div>

            {/* Resume */}
            <div className="flex gap-4">
              <div
                className={`w-10 h-10 shrink-0 rounded-xl font-bold flex items-center justify-center ${
                  resumeUploaded
                    ? "bg-green-50 text-green-700"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                {resumeUploaded ? (
                  <CheckCircle size={20} />
                ) : (
                  "02"
                )}
              </div>

              <div>
                <h4 className="font-semibold text-slate-800">
                  {resumeUploaded
                    ? "Resume uploaded successfully"
                    : "Upload your resume"}
                </h4>

                <p className="text-sm text-slate-500 mt-1">
                  {resumeUploaded
                    ? "Your resume is saved. You can analyze or replace it anytime."
                    : "Prepare your resume for AI-powered analysis."}
                </p>

                <Link
                  to="/student/resume"
                  className="inline-block text-sm text-blue-600 font-semibold mt-2 hover:underline"
                >
                  {resumeUploaded
                    ? "View My Resume →"
                    : "Upload Resume →"}
                </Link>
              </div>
            </div>

            {/* Explore Jobs */}
            <div className="flex gap-4">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center">
                03
              </div>

              <div>
                <h4 className="font-semibold text-slate-800">
                  Explore job opportunities
                </h4>

                <p className="text-sm text-slate-500 mt-1">
                  Find roles aligned with your skills and goals.
                </p>

                <Link
                  to="/student/jobs"
                  className="inline-block text-sm text-blue-600 font-semibold mt-2 hover:underline"
                >
                  Explore Jobs →
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* AI Career Insights */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
          <Sparkles className="text-blue-600" size={25} />

          <h3 className="text-lg font-bold text-[#111C35] mt-4">
            AI Career Insights
          </h3>

          <p className="text-sm text-slate-600 mt-2 leading-6">
            Your AI career assistant will help you understand skill gaps,
            improve your resume and explore suitable career paths.
          </p>

          <span className="inline-block mt-5 text-xs font-semibold text-blue-700 bg-white px-3 py-2 rounded-lg">
            Career assistance available
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-7 flex flex-wrap gap-3">
        <Link
          to="/student/profile"
          className="bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 flex items-center gap-2"
        >
          Build My Profile
          <ArrowUpRight size={17} />
        </Link>

        <Link
          to="/student/resume"
          className="bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-xl font-semibold text-sm hover:bg-slate-50 flex items-center gap-2"
        >
          <FileText size={17} />
          My Resume
        </Link>

        <Link
          to="/student/jobs"
          className="bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-xl font-semibold text-sm hover:bg-slate-50"
        >
          Explore Jobs
        </Link>

        <Link
          to="/student/applications"
          className="bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-xl font-semibold text-sm hover:bg-slate-50 flex items-center gap-2"
        >
          <BriefcaseBusiness size={17} />
          My Applications
        </Link>
      </div>
    </DashboardLayout>
  );
}

export default StudentDashboard;
