
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  UserRound,
  Mail,
  LockKeyhole,
  BriefcaseBusiness,
  Eye,
  EyeOff,
} from "lucide-react";
import { registerUser } from "../services/authService";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const { confirmPassword, ...userData } = formData;

      const response = await registerUser(userData);

      setSuccess(response.message || "Account created successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100">

        {/* Left branding section */}
        <div className="hidden lg:flex bg-[#111C35] text-white p-12 flex-col justify-between">
          <Link to="/login" className="text-3xl font-bold">
            Career<span className="text-blue-400">Pilot</span>
          </Link>

          <div className="max-w-md">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-7">
              <Sparkles size={28} className="text-blue-400" />
            </div>

            <h1 className="text-4xl font-bold leading-tight">
              Build your future with the right opportunities.
            </h1>

            <p className="text-slate-300 mt-6 leading-8">
              Create your CareerPilot account to explore career
              opportunities, improve your skills and move closer
              to your professional goals.
            </p>

            <div className="mt-10 space-y-4 text-slate-300">
              <p className="flex items-center gap-3">
                <BriefcaseBusiness size={19} className="text-blue-400" />
                Discover relevant job opportunities
              </p>
              <p className="flex items-center gap-3">
                <UserRound size={19} className="text-blue-400" />
                Build your professional profile
              </p>
              <p className="flex items-center gap-3">
                <Sparkles size={19} className="text-blue-400" />
                Get AI-powered career insights
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-400">
            Your journey. Your potential. Your future.
          </p>
        </div>

        {/* Registration form */}
        <div className="p-6 sm:p-10 lg:p-12">
          <div className="max-w-md mx-auto">
            <div className="lg:hidden mb-8">
              <Link to="/login" className="text-3xl font-bold text-[#111C35]">
                Career<span className="text-blue-600">Pilot</span>
              </Link>
            </div>

            <div className="mb-7">
              <p className="text-sm font-semibold text-blue-600 mb-2">
                GET STARTED
              </p>

              <h2 className="text-3xl font-bold text-[#111C35]">
                Create your account
              </h2>

              <p className="text-slate-500 mt-2">
                Join CareerPilot and take the next step in your career.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Full name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full name
                </label>

                <div className="relative">
                  <UserRound className="absolute left-4 top-3.5 text-slate-400" size={19} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email address
                </label>

                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-slate-400" size={19} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  I want to register as
                </label>

                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="student">Student / Job Seeker</option>
                  <option value="recruiter">Recruiter</option>
                </select>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-3.5 text-slate-400" size={19} />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 8 characters"
                    className="w-full border border-slate-200 rounded-xl pl-11 pr-12 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-400"
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm password
                </label>

                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Messages */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 text-sm">
                  {success}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition"
              >
                {loading ? "Creating account..." : "Create Account"}
                {!loading && <ArrowRight size={19} />}
              </button>
            </form>

            <p className="text-center text-slate-500 text-sm mt-7">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                Sign in
              </Link>
            </p>

            <p className="text-center text-xs text-slate-400 mt-6">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
