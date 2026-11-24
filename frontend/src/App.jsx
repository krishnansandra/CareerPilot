
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import StudentDashboard from "./pages/StudentDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import RoleRoute from "./routes/RoleRoute";
import { AuthProvider } from "./context/AuthContext";

import StudentProfile from "./pages/StudentProfile";
import DashboardLayout from "./layouts/DashboardLayout";
import RecruiterProfile from "./pages/RecruiterProfile";
import RecruiterJobs from "./pages/RecruiterJobs";
import PostJob from "./pages/PostJob";
import EditJob from "./pages/EditJob";
import StudentJobs from "./pages/StudentJobs";
import StudentJobDetails from "./pages/StudentJobDetails";
import StudentApplications from "./pages/StudentApplications";
import RecruiterApplicants from "./pages/RecruiterApplicants";
import AdminRecruiters from "./pages/AdminRecruiters";
import AdminUsers from "./pages/AdminUsers";
import Resume from "./pages/Resume";
import SkillRoadmap from "./pages/SkillRoadmap";
import InterviewPreparation from "./pages/InterviewPreparation";
import Notifications from "./pages/Notifications";
import ResumeBuilder from "./pages/ResumeBuilder";
import InterviewHistory from "./pages/InterviewHistory";
import StudentInterviews from "./pages/StudentInterviews";
import RecruiterInterviews from "./pages/RecruiterInterviews";
import AdminJobs from "./pages/AdminJobs";
import AdminReports from "./pages/AdminReports";


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/student/dashboard"
            element={
              <RoleRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/recruiter/dashboard"
            element={
              <RoleRoute allowedRoles={["recruiter"]}>
                <RecruiterDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </RoleRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
          <Route
  path="/student/profile"
  element={
    <RoleRoute allowedRoles={["student"]}>
      <DashboardLayout>
        <StudentProfile />
      </DashboardLayout>
    </RoleRoute>
  }
/>


<Route
  path="/recruiter/profile"
  element={
    <RoleRoute allowedRoles={["recruiter"]}>
      <DashboardLayout>
        <RecruiterProfile />
      </DashboardLayout>
    </RoleRoute>
  }
/>
<Route
  path="/recruiter/jobs"
  element={
    <RoleRoute allowedRoles={["recruiter"]}>
      <DashboardLayout>
        <RecruiterJobs />
      </DashboardLayout>
    </RoleRoute>
  }
/>
<Route
  path="/recruiter/jobs/new"
  element={
    <RoleRoute allowedRoles={["recruiter"]}>
      <DashboardLayout>
        <PostJob />
      </DashboardLayout>
    </RoleRoute>
  }
/>

<Route
  path="/recruiter/jobs/:id/edit"
  element={
    <RoleRoute allowedRoles={["recruiter"]}>
      <DashboardLayout>
        <EditJob />
      </DashboardLayout>
    </RoleRoute>
  }
/>

<Route
  path="/student/jobs"
  element={
    <RoleRoute allowedRoles={["student"]}>
      <DashboardLayout>
        <StudentJobs />
      </DashboardLayout>
    </RoleRoute>
  }
/>


<Route
  path="/student/jobs/:id"
  element={
    <RoleRoute allowedRoles={["student"]}>
      <DashboardLayout>
        <StudentJobDetails />
      </DashboardLayout>
    </RoleRoute>
  }
/>

<Route
  path="/student/applications"
  element={
    <RoleRoute allowedRoles={["student"]}>
      <DashboardLayout>
        <StudentApplications />
      </DashboardLayout>
    </RoleRoute>
  }
/>

<Route
  path="/recruiter/applicants"
  element={
    <RoleRoute allowedRoles={["recruiter"]}>
      <DashboardLayout>
        <RecruiterApplicants />
      </DashboardLayout>
    </RoleRoute>
  }
/>

<Route
  path="/admin/recruiters"
  element={
    <RoleRoute allowedRoles={["admin"]}>
      <AdminRecruiters />
    </RoleRoute>
  }
/>

<Route
  path="/admin/users"
  element={
    <RoleRoute allowedRoles={["admin"]}>
      <AdminUsers />
    </RoleRoute>
  }
/>

<Route
  path="/student/resume"
  element={
    <RoleRoute allowedRoles={["student"]}>
      <Resume />
    </RoleRoute>
  }
/>
<Route
  path="/student/skill-roadmap"
  element={
    <RoleRoute allowedRoles={["student"]}>
      <SkillRoadmap />
    </RoleRoute>
  }
/>
<Route
  path="/student/interview-preparation"
  element={
    <RoleRoute allowedRoles={["student"]}>
      <DashboardLayout>
        <InterviewPreparation />
      </DashboardLayout>
    </RoleRoute>
  }
/>

<Route
  path="/student/notifications"
  element={
    <RoleRoute allowedRoles={["student"]}>
      <Notifications />
    </RoleRoute>
  }
/>
<Route
  path="/student/resume-builder"
  element={
    <RoleRoute allowedRoles={["student"]}>
      <ResumeBuilder />
    </RoleRoute>
  }
/>
<Route
  path="/student/interview-history"
  element={
    <RoleRoute allowedRoles={["student"]}>
      <DashboardLayout>
        <InterviewHistory />
      </DashboardLayout>
    </RoleRoute>
  }
/>
<Route
  path="/student/interviews"
  element={
    <RoleRoute allowedRoles={["student"]}>
      <DashboardLayout>
        <StudentInterviews />
      </DashboardLayout>
    </RoleRoute>
  }
/>
<Route
  path="/recruiter/interviews"
  element={
    <RoleRoute allowedRoles={["recruiter"]}>
      <DashboardLayout>
        <RecruiterInterviews />
      </DashboardLayout>
    </RoleRoute>
  }
/>
<Route
  path="/admin/jobs"
  element={
    <RoleRoute allowedRoles={["admin"]}>
      <AdminJobs />
    </RoleRoute>
  }
/>
<Route
  path="/admin/reports"
  element={
    <RoleRoute allowedRoles={["admin"]}>
      <AdminReports />
    </RoleRoute>
  }
/>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
