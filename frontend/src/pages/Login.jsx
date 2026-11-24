
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  Sparkles,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email.trim() || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await login(
        formData.email,
        formData.password
      );

      const role = response.user.role;

      if (role === "student") {
        navigate("/student/dashboard");
      } else if (role === "recruiter") {
        navigate("/recruiter/dashboard");
      } else if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        setError("Your account has an unsupported role.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex">
      {/* Branding section */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#111C35] text-white p-16 flex-col justify-between">
        <Link to="/" className="text-3xl font-bold">
          Career<span className="text-blue-400">Pilot</span>
        </Link>

        <div className="max-w-lg">
          <div className="flex items-center gap-2 text-blue-400 mb-6">
            <Sparkles size={20} />
            <span className="text-sm font-semibold">
              YOUR AI-POWERED CAREER COMPANION
            </span>
          </div>

          <h1 className="text-5xl font-bold leading-tight">
            Navigate your career with confidence.
          </h1>

          <p className="mt-6 text-slate-300 text-lg leading-8">
            Discover opportunities, improve your resume,
            identify skill gaps and take the next step
            towards your dream career.
          </p>
        </div>

        <p className="text-slate-400 text-sm">
          Empowering students and professionals to move forward.
        </p>
      </div>

      {/* Login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          <div className="lg:hidden mb-10 text-center">
            <Link to="/" className="text-3xl font-bold text-slate-900">
              Career<span className="text-blue-600">Pilot</span>
            </Link>
          </div>

          <div className="mb-8">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-5">
              <BriefcaseBusiness size={24} />
            </div>

            <h2 className="text-3xl font-bold text-slate-900">
              Welcome back!
            </h2>

            <p className="text-slate-500 mt-2">
              Sign in to continue your career journey.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

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
                  placeholder="Enter your password"
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

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition"
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <ArrowRight size={19} />}
            </button>
          </form>

          <p className="text-center text-slate-500 mt-7">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-semibold hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
