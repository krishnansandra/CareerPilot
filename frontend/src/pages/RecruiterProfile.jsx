
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getRecruiterProfile,
  createRecruiterProfile,
  updateRecruiterProfile,
} from "../services/recruiterProfileService";
import {
  Building2,
  Globe,
  MapPin,
  Mail,
  Phone,
  Save,
  LoaderCircle,
} from "lucide-react";

const initialForm = {
  companyName: "",
  industry: "",
  companySize: "",
  website: "",
  location: "",
  description: "",
  logoUrl: "",
  contactEmail: "",
  contactPhone: "",
};

function RecruiterProfile() {
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
        const response = await getRecruiterProfile(token);

        setForm({
          ...initialForm,
          ...response.profile,
        });

        setHasProfile(true);
      } catch (err) {
        if (err.response?.status === 404) {
          setHasProfile(false);
        } else {
          setError(
            err.response?.data?.message ||
              "Unable to load company profile."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) loadProfile();
  }, [token]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      if (hasProfile) {
        await updateRecruiterProfile(form, token);
        setMessage("Company profile updated successfully!");
      } else {
        await createRecruiterProfile(form, token);
        setHasProfile(true);
        setMessage("Company profile created successfully!");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save company profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoaderCircle className="animate-spin text-blue-600" size={30} />
      </div>
    );
  }

  const fields = [
    {
      name: "companyName",
      label: "Company Name",
      icon: Building2,
      required: true,
    },
    {
      name: "industry",
      label: "Industry",
      icon: Building2,
    },
    {
      name: "website",
      label: "Company Website",
      icon: Globe,
    },
    {
      name: "location",
      label: "Company Location",
      icon: MapPin,
    },
    {
      name: "contactEmail",
      label: "Contact Email",
      icon: Mail,
    },
    {
      name: "contactPhone",
      label: "Contact Phone",
      icon: Phone,
    },
    {
      name: "logoUrl",
      label: "Company Logo URL",
      icon: Globe,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-blue-600">
          RECRUITER WORKSPACE
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Company Profile
        </h1>

        <p className="mt-2 text-slate-500">
          Manage your company information and build trust with job seekers.
        </p>
      </div>

      {message && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
      >
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <Building2 size={28} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Company Information
            </h2>
            <p className="text-sm text-slate-500">
              Registered recruiter: {user?.name}
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {fields.map((field) => {
            const Icon = field.icon;

            return (
              <div key={field.name}>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {field.label}
                  {field.required && (
                    <span className="text-red-500"> *</span>
                  )}
                </label>

                <div className="flex items-center rounded-xl border border-slate-200 px-3 focus-within:border-blue-500">
                  <Icon size={17} className="text-slate-400" />

                  <input
                    type="text"
                    name={field.name}
                    value={form[field.name] || ""}
                    onChange={handleChange}
                    required={field.required}
                    className="w-full bg-transparent px-3 py-3 text-sm outline-none"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                </div>
              </div>
            );
          })}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Company Size
            </label>

            <select
              name="companySize"
              value={form.companySize || ""}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="">Select company size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="501-1000">501-1000 employees</option>
              <option value="1000+">1000+ employees</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Company Description
          </label>

          <textarea
            name="description"
            value={form.description || ""}
            onChange={handleChange}
            rows={5}
            maxLength={1500}
            placeholder="Tell job seekers about your company, its mission and work culture..."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />

          <p className="mt-1 text-right text-xs text-slate-400">
            {(form.description || "").length}/1500 characters
          </p>
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-6">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}

            {saving
              ? "Saving..."
              : hasProfile
              ? "Update Company Profile"
              : "Create Company Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default RecruiterProfile;
