
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getStudentProfile,
  createStudentProfile,
  updateStudentProfile,
} from "../services/studentProfileService";
import {
  UserRound,
  GraduationCap,
  Code2,
  BriefcaseBusiness,
  Save,
  LoaderCircle,
} from "lucide-react";

const initialForm = {
  phone: "",
  location: "",
  professionalSummary: "",
  qualification: "",
  institution: "",
  specialization: "",
  graduationYear: "",
  grade: "",
  skills: "",
  careerInterests: "",
  preferredJobRoles: "",
  linkedinUrl: "",
  githubUrl: "",
  portfolioUrl: "",
};

function StudentProfile() {
  const { user, token } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getStudentProfile(token);
        const profile = response.profile;
        const education = profile.education?.[0] || {};

        setForm({
          phone: profile.phone || "",
          location: profile.location || "",
          professionalSummary: profile.professionalSummary || "",
          qualification: education.qualification || "",
          institution: education.institution || "",
          specialization: education.specialization || "",
          graduationYear: education.graduationYear || "",
          grade: education.grade || "",
          skills: (profile.skills || []).join(", "),
          careerInterests: (profile.careerInterests || []).join(", "),
          preferredJobRoles: (profile.preferredJobRoles || []).join(", "),
          linkedinUrl: profile.linkedinUrl || "",
          githubUrl: profile.githubUrl || "",
          portfolioUrl: profile.portfolioUrl || "",
        });

        setHasProfile(true);
      } catch (err) {
        if (err.response?.status === 404) {
          setHasProfile(false);
        } else {
          setError("Unable to load your profile. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const toArray = (value) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    const profileData = {
      phone: form.phone,
      location: form.location,
      professionalSummary: form.professionalSummary,

      education: [
        {
          qualification: form.qualification,
          institution: form.institution,
          specialization: form.specialization,
          graduationYear: form.graduationYear
            ? Number(form.graduationYear)
            : undefined,
          grade: form.grade,
        },
      ],

      skills: toArray(form.skills),
      careerInterests: toArray(form.careerInterests),
      preferredJobRoles: toArray(form.preferredJobRoles),

      linkedinUrl: form.linkedinUrl,
      githubUrl: form.githubUrl,
      portfolioUrl: form.portfolioUrl,
    };

    try {
      if (hasProfile) {
        await updateStudentProfile(profileData, token);
        setMessage("Your profile has been updated successfully.");
      } else {
        await createStudentProfile(profileData, token);
        setHasProfile(true);
        setMessage("Your profile has been created successfully.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const labelClass =
    "mb-2 block text-sm font-medium text-slate-700";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoaderCircle className="animate-spin text-blue-600" size={28} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-5xl">

        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-600">
            CAREERPILOT / PROFILE
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Build your professional profile to receive relevant career
            recommendations.
          </p>
        </div>

        <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
              {user?.name?.charAt(0)?.toUpperCase() || "S"}
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                {user?.name}
              </h2>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <p className="mt-1 text-xs font-medium uppercase text-blue-600">
                Student Account
              </p>
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-5 rounded-lg bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Personal Information */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <UserRound className="text-blue-600" />
              <div>
                <h2 className="font-semibold text-slate-900">
                  Personal Information
                </h2>
                <p className="text-xs text-slate-500">
                  Your contact and professional details
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>Full Name</label>
                <input
                  className={inputClass}
                  value={user?.name || ""}
                  disabled
                />
              </div>

              <div>
                <label className={labelClass}>Email Address</label>
                <input
                  className={inputClass}
                  value={user?.email || ""}
                  disabled
                />
              </div>

              <div>
                <label className={labelClass}>Phone Number</label>
                <input
                  name="phone"
                  className={inputClass}
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className={labelClass}>Location</label>
                <input
                  name="location"
                  className={inputClass}
                  value={form.location}
                  onChange={handleChange}
                  placeholder="City, Country"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className={labelClass}>Professional Summary</label>
              <textarea
                name="professionalSummary"
                className={inputClass}
                rows="4"
                maxLength="1000"
                value={form.professionalSummary}
                onChange={handleChange}
                placeholder="Write a short professional introduction..."
              />
            </div>
          </section>

          {/* Education */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <GraduationCap className="text-blue-600" />
              <div>
                <h2 className="font-semibold text-slate-900">
                  Education
                </h2>
                <p className="text-xs text-slate-500">
                  Add your academic qualifications
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>Qualification</label>
                <input
                  name="qualification"
                  className={inputClass}
                  value={form.qualification}
                  onChange={handleChange}
                  placeholder="e.g. MCA"
                />
              </div>

              <div>
                <label className={labelClass}>Institution</label>
                <input
                  name="institution"
                  className={inputClass}
                  value={form.institution}
                  onChange={handleChange}
                  placeholder="College or university"
                />
              </div>

              <div>
                <label className={labelClass}>Specialization</label>
                <input
                  name="specialization"
                  className={inputClass}
                  value={form.specialization}
                  onChange={handleChange}
                  placeholder="e.g. Computer Applications"
                />
              </div>

              <div>
                <label className={labelClass}>Graduation Year</label>
                <input
                  type="number"
                  name="graduationYear"
                  className={inputClass}
                  value={form.graduationYear}
                  onChange={handleChange}
                  placeholder="e.g. 2026"
                />
              </div>

              <div>
                <label className={labelClass}>Grade / CGPA</label>
                <input
                  name="grade"
                  className={inputClass}
                  value={form.grade}
                  onChange={handleChange}
                  placeholder="e.g. 9.59 CGPA"
                />
              </div>
            </div>
          </section>

          {/* Skills and Career Preferences */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <Code2 className="text-blue-600" />
              <div>
                <h2 className="font-semibold text-slate-900">
                  Skills & Career Preferences
                </h2>
                <p className="text-xs text-slate-500">
                  Tell us about your technical interests
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className={labelClass}>
                  Technical Skills
                </label>
                <textarea
                  name="skills"
                  className={inputClass}
                  rows="3"
                  value={form.skills}
                  onChange={handleChange}
                  placeholder="React.js, JavaScript, Node.js, MongoDB"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Separate each skill with a comma.
                </p>
              </div>

              <div>
                <label className={labelClass}>Career Interests</label>
                <input
                  name="careerInterests"
                  className={inputClass}
                  value={form.careerInterests}
                  onChange={handleChange}
                  placeholder="Web Development, AI, Software Engineering"
                />
              </div>

              <div>
                <label className={labelClass}>
                  Preferred Job Roles
                </label>
                <input
                  name="preferredJobRoles"
                  className={inputClass}
                  value={form.preferredJobRoles}
                  onChange={handleChange}
                  placeholder="React Developer, MERN Stack Developer"
                />
              </div>
            </div>
          </section>

          {/* Professional Links */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <BriefcaseBusiness className="text-blue-600" />
              <div>
                <h2 className="font-semibold text-slate-900">
                  Professional Links
                </h2>
                <p className="text-xs text-slate-500">
                  Add links to your professional presence
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className={labelClass}>LinkedIn URL</label>
                <input
                  name="linkedinUrl"
                  className={inputClass}
                  value={form.linkedinUrl}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div>
                <label className={labelClass}>GitHub URL</label>
                <input
                  name="githubUrl"
                  className={inputClass}
                  value={form.githubUrl}
                  onChange={handleChange}
                  placeholder="https://github.com/..."
                />
              </div>

              <div>
                <label className={labelClass}>Portfolio URL</label>
                <input
                  name="portfolioUrl"
                  className={inputClass}
                  value={form.portfolioUrl}
                  onChange={handleChange}
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {saving ? "Saving..." : hasProfile ? "Update Profile" : "Create Profile"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default StudentProfile;
