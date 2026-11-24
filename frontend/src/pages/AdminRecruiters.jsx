
import { useEffect, useState } from "react";
import {
  Building2,
  Mail,
  MapPin,
  Globe,
  CheckCircle,
  XCircle,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import {
  getAllRecruiters,
  updateRecruiterVerification,
} from "../services/adminService";

function AdminRecruiters() {
  const { user } = useAuth();

  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("careerpilot_token");

  const fetchRecruiters = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllRecruiters(token);
      setRecruiters(data.recruiters || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load recruiter profiles."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiters();
  }, []);

  const handleVerification = async (recruiterId, status) => {
    try {
      setUpdatingId(recruiterId);
      setError("");
      setMessage("");

      const data = await updateRecruiterVerification(
        recruiterId,
        status,
        token
      );

      setRecruiters((previous) =>
        previous.map((recruiter) =>
          recruiter._id === recruiterId
            ? data.recruiter
            : recruiter
        )
      );

      setMessage(data.message);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update verification status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const statusStyle = {
    pending: "bg-amber-50 text-amber-700",
    verified: "bg-green-50 text-green-700",
    rejected: "bg-red-50 text-red-700",
  };

  return (
    <DashboardLayout
      title="Recruiter Management"
      subtitle="Review and verify registered company accounts"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#111C35]">
            Recruiter Profiles
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Review company information and manage verification.
          </p>
        </div>

        <button
          onClick={fetchRecruiters}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {message && (
        <div className="mb-5 rounded-xl bg-green-50 text-green-700 p-4 text-sm">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-xl bg-red-50 text-red-700 p-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl p-10 text-center text-slate-500">
          Loading recruiter profiles...
        </div>
      ) : recruiters.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <Building2 size={36} className="mx-auto text-slate-400" />
          <h3 className="font-bold text-[#111C35] mt-4">
            No recruiter profiles found
          </h3>
          <p className="text-sm text-slate-500 mt-2">
            Registered recruiter company profiles will appear here.
          </p>
        </div>
      ) : (
        <div className="grid xl:grid-cols-2 gap-5">
          {recruiters.map((recruiter) => (
            <div
              key={recruiter._id}
              className="bg-white border border-slate-200 rounded-2xl p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                    <Building2 size={23} />
                  </div>

                  <div>
                    <h3 className="font-bold text-[#111C35]">
                      {recruiter.companyName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {recruiter.industry || "Industry not specified"}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize ${
                    statusStyle[recruiter.verificationStatus] ||
                    "bg-slate-100 text-slate-600"
                  }`}
                >
                  {recruiter.verificationStatus}
                </span>
              </div>

              <div className="mt-6 space-y-3 text-sm text-slate-600">
                <p className="flex items-center gap-2">
                  <ShieldCheck size={16} />
                  {recruiter.user?.name || "Recruiter name unavailable"}
                </p>

                <p className="flex items-center gap-2">
                  <Mail size={16} />
                  {recruiter.user?.email || recruiter.contactEmail || "Email unavailable"}
                </p>

                <p className="flex items-center gap-2">
                  <MapPin size={16} />
                  {recruiter.location || "Location not provided"}
                </p>

                {recruiter.website && (
                  <p className="flex items-center gap-2 break-all">
                    <Globe size={16} />
                    {recruiter.website}
                  </p>
                )}
              </div>

              {recruiter.description && (
                <p className="text-sm text-slate-500 leading-6 mt-4">
                  {recruiter.description}
                </p>
              )}

              <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-slate-100">
                <button
                  onClick={() =>
                    handleVerification(recruiter._id, "verified")
                  }
                  disabled={
                    updatingId === recruiter._id ||
                    recruiter.verificationStatus === "verified"
                  }
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-green-600 text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckCircle size={16} />
                  Approve
                </button>

                <button
                  onClick={() =>
                    handleVerification(recruiter._id, "rejected")
                  }
                  disabled={
                    updatingId === recruiter._id ||
                    recruiter.verificationStatus === "rejected"
                  }
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-red-50 text-red-700 rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-red-100 disabled:opacity-50"
                >
                  <XCircle size={16} />
                  Reject
                </button>
              </div>

              {updatingId === recruiter._id && (
                <p className="text-xs text-slate-500 mt-3">
                  Updating verification status...
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

export default AdminRecruiters;
