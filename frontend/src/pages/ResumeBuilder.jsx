
import { useEffect, useState } from "react";

import {
  FileText,
  UserRound,
  GraduationCap,
  Code,
  BriefcaseBusiness,
  FolderKanban,
  Award,
  Plus,
  Trash2,
  Eye,
  RefreshCw,
  CheckCircle,
  Download,
  Palette,
} from "lucide-react";

import { jsPDF } from "jspdf";

import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { getStudentProfile } from "../services/studentProfileService";

import {
  getMyResume,
  saveMyResume,
  updateMyResume,
} from "../services/resumeBuilderService";

// --------------------------------------------------
// REUSABLE SECTION COMPONENT
// --------------------------------------------------

const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 space-y-5">
    <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
      <div className="p-2 bg-blue-50 rounded-lg">
        <Icon className="text-blue-600" size={21} />
      </div>

      <h2 className="text-lg font-bold text-gray-800">
        {title}
      </h2>
    </div>

    {children}
  </div>
);

// --------------------------------------------------
// RESUME PREVIEW COMPONENT
// --------------------------------------------------

const ResumePreview = ({ data, template }) => {
  const skills = (data.skills || "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  const hasEducation = data.education.some(
    (item) => item.degree || item.institution
  );

  const hasExperience = data.experience.some(
    (item) => item.role || item.company || item.description
  );

  const hasProjects = data.projects.some(
    (item) => item.title || item.description
  );

  const certifications = data.certifications.filter(
    (item) => item.trim()
  );

  const headingStyle =
    template === "modern"
      ? "text-blue-700 border-blue-300"
      : template === "professional"
      ? "text-gray-900 border-gray-500"
      : "text-black border-gray-300";

  const headerStyle =
    template === "modern"
      ? "text-left border-b-4 border-blue-600"
      : template === "professional"
      ? "text-center border-b-2 border-gray-800"
      : "text-left border-b border-gray-400";

  const sectionHeading = (title) => (
    <h2
      className={`text-base font-bold uppercase border-b pb-1 mb-3 ${headingStyle}`}
    >
      {title}
    </h2>
  );

  return (
    <div
      className={`bg-white text-gray-900 border shadow-lg rounded-lg p-8 md:p-12 max-w-4xl mx-auto ${
        template === "modern"
          ? "border-blue-200"
          : template === "professional"
          ? "border-gray-300"
          : "border-gray-200"
      }`}
    >
      {/* PERSONAL DETAILS */}

      <div className={`pb-5 mb-6 ${headerStyle}`}>
        <h1
          className={`text-3xl font-bold uppercase tracking-wide ${
            template === "modern"
              ? "text-blue-700"
              : "text-gray-900"
          }`}
        >
          {data.fullName || "Your Name"}
        </h1>

        <p className="text-sm mt-3 text-gray-600">
          {[data.email, data.phone, data.location]
            .filter(Boolean)
            .join(" | ")}
        </p>

        <p className="text-sm mt-2 text-gray-600 break-words">
          {[data.linkedin, data.github, data.portfolio]
            .filter(Boolean)
            .join(" | ")}
        </p>
      </div>

      {/* PROFESSIONAL SUMMARY */}

      {data.summary?.trim() && (
        <section className="mb-6">
          {sectionHeading("Professional Summary")}

          <p className="text-sm leading-6 whitespace-pre-line">
            {data.summary}
          </p>
        </section>
      )}

      {/* TECHNICAL SKILLS */}

      {skills.length > 0 && (
        <section className="mb-6">
          {sectionHeading("Technical Skills")}

          <p className="text-sm leading-6">
            {skills.join(" • ")}
          </p>
        </section>
      )}

      {/* EDUCATION */}

      {hasEducation && (
        <section className="mb-6">
          {sectionHeading("Education")}

          {data.education.map((item, index) =>
            item.degree || item.institution ? (
              <div key={index} className="mb-4">
                <div className="flex flex-wrap justify-between gap-2">
                  <h3 className="font-semibold text-sm">
                    {item.degree}
                  </h3>

                  <span className="text-sm">
                    {item.year}
                  </span>
                </div>

                <p className="text-sm">
                  {item.institution}
                </p>

                {item.grade && (
                  <p className="text-sm text-gray-700">
                    Grade: {item.grade}
                  </p>
                )}
              </div>
            ) : null
          )}
        </section>
      )}

      {/* WORK EXPERIENCE */}

      {hasExperience && (
        <section className="mb-6">
          {sectionHeading("Work Experience")}

          {data.experience.map((item, index) =>
            item.role || item.company || item.description ? (
              <div key={index} className="mb-4">
                <div className="flex flex-wrap justify-between gap-2">
                  <h3 className="font-semibold text-sm">
                    {item.role}
                  </h3>

                  <span className="text-sm">
                    {item.duration}
                  </span>
                </div>

                <p className="text-sm font-medium">
                  {item.company}
                </p>

                {item.description && (
                  <p className="text-sm leading-6 whitespace-pre-line mt-1">
                    {item.description}
                  </p>
                )}
              </div>
            ) : null
          )}
        </section>
      )}

      {/* PROJECTS */}

      {hasProjects && (
        <section className="mb-6">
          {sectionHeading("Projects")}

          {data.projects.map((item, index) =>
            item.title || item.description ? (
              <div key={index} className="mb-4">
                <h3 className="font-semibold text-sm">
                  {item.title}
                </h3>

                {item.technologies && (
                  <p className="text-sm italic text-gray-700">
                    Technologies: {item.technologies}
                  </p>
                )}

                {item.description && (
                  <p className="text-sm leading-6 whitespace-pre-line mt-1">
                    {item.description}
                  </p>
                )}
              </div>
            ) : null
          )}
        </section>
      )}

      {/* CERTIFICATIONS */}

      {certifications.length > 0 && (
        <section className="mb-2">
          {sectionHeading("Certifications")}

          <ul className="list-disc pl-5 space-y-1">
            {certifications.map((item, index) => (
              <li key={index} className="text-sm">
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

// --------------------------------------------------
// MAIN RESUME BUILDER
// --------------------------------------------------

function ResumeBuilder() {
  const { user, token } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
    summary: "",
    skills: "",

    education: [
      {
        degree: "",
        institution: "",
        year: "",
        grade: "",
      },
    ],

    experience: [
      {
        role: "",
        company: "",
        duration: "",
        description: "",
      },
    ],

    projects: [
      {
        title: "",
        technologies: "",
        description: "",
      },
    ],

    certifications: [""],
  });

  const [profileLoading, setProfileLoading] = useState(true);
  const [profileMessage, setProfileMessage] = useState("");

  const [saving, setSaving] = useState(false);
  const [hasSavedResume, setHasSavedResume] = useState(false);

  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  const [showPreview, setShowPreview] = useState(false);

  const [selectedTemplate, setSelectedTemplate] =
    useState("modern");

  // --------------------------------------------------
  // FORMAT PROFILE DATES
  // --------------------------------------------------

  const formatDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  // --------------------------------------------------
  // LOAD SAVED RESUME OR STUDENT PROFILE
  // --------------------------------------------------

  useEffect(() => {
    const loadStudentProfile = async () => {
      if (!token) {
        setProfileLoading(false);
        return;
      }

      try {
        setProfileLoading(true);

        const savedResponse = await getMyResume(token);

        if (savedResponse.resume) {
          const saved = savedResponse.resume;

          setFormData({
            fullName: saved.fullName || "",
            email: saved.email || "",
            phone: saved.phone || "",
            location: saved.location || "",
            linkedin: saved.linkedin || "",
            github: saved.github || "",
            portfolio: saved.portfolio || "",
            summary: saved.summary || "",
            skills: saved.skills || "",

            education: saved.education?.length
              ? saved.education.map((item) => ({
                  degree: item.degree || "",
                  institution: item.institution || "",
                  year: item.year || "",
                  grade: item.grade || "",
                }))
              : [
                  {
                    degree: "",
                    institution: "",
                    year: "",
                    grade: "",
                  },
                ],

            experience: saved.experience?.length
              ? saved.experience.map((item) => ({
                  role: item.role || "",
                  company: item.company || "",
                  duration: item.duration || "",
                  description: item.description || "",
                }))
              : [
                  {
                    role: "",
                    company: "",
                    duration: "",
                    description: "",
                  },
                ],

            projects: saved.projects?.length
              ? saved.projects.map((item) => ({
                  title: item.title || "",
                  technologies: item.technologies || "",
                  description: item.description || "",
                }))
              : [
                  {
                    title: "",
                    technologies: "",
                    description: "",
                  },
                ],

            certifications: saved.certifications?.length
              ? saved.certifications
              : [""],
              
          });
          setSelectedTemplate(saved.template || "modern");

          setHasSavedResume(true);

          setProfileMessage(
            "Your saved Resume Builder details have been loaded."
          );

          return;
        }

        // No saved resume: load details from Student Profile.

        const response = await getStudentProfile(token);
        const profile = response.profile || response;

        const profileUser =
          typeof profile.user === "object"
            ? profile.user
            : null;

        const educationData = profile.education?.length
          ? profile.education.map((item) => ({
              degree: item.qualification || "",
              institution: item.institution || "",
              year: item.graduationYear
                ? String(item.graduationYear)
                : "",
              grade: item.grade || "",
            }))
          : null;

        const experienceData = profile.experience?.length
          ? profile.experience.map((item) => {
              const startDate = formatDate(item.startDate);

              const endDate = item.currentlyWorking
                ? "Present"
                : formatDate(item.endDate);

              return {
                role: item.jobTitle || "",
                company: item.company || "",
                duration: [startDate, endDate]
                  .filter(Boolean)
                  .join(" - "),
                description: item.description || "",
              };
            })
          : null;

        const projectData = profile.projects?.length
          ? profile.projects.map((item) => ({
              title: item.title || "",

              technologies: Array.isArray(item.technologies)
                ? item.technologies.join(", ")
                : item.technologies || "",

              description: item.description || "",
            }))
          : null;

        setFormData((prev) => ({
          ...prev,

          fullName:
            profileUser?.name ||
            user?.name ||
            prev.fullName,

          email:
            profileUser?.email ||
            user?.email ||
            prev.email,

          phone: profile.phone || "",
          location: profile.location || "",

          linkedin: profile.linkedinUrl || "",
          github: profile.githubUrl || "",
          portfolio: profile.portfolioUrl || "",

          summary: profile.professionalSummary || "",

          skills: Array.isArray(profile.skills)
            ? profile.skills.join(", ")
            : profile.skills || "",

          education: educationData || prev.education,
          experience: experienceData || prev.experience,
          projects: projectData || prev.projects,
        }));

        setProfileMessage(
          "Your saved profile information has been loaded."
        );
      } catch (error) {
        if (error.response?.status === 404) {
          setProfileMessage(
            "No saved student profile found. You can enter your details manually."
          );
        } else {
          console.error(
            "Unable to load resume details:",
            error.response?.data || error.message
          );

          setProfileMessage(
            "Unable to load your profile. You can enter your details manually."
          );
        }

        setFormData((prev) => ({
          ...prev,
          fullName: user?.name || prev.fullName,
          email: user?.email || prev.email,
        }));
      } finally {
        setProfileLoading(false);
      }
    };

    loadStudentProfile();
  }, [token, user?.name, user?.email]);

  // --------------------------------------------------
  // SAVE OR UPDATE RESUME
  // --------------------------------------------------

  const handleSaveResume = async () => {
    try {
      setSaving(true);
      setSaveError("");
      setSaveMessage("");

      const cleanedData = {
        ...formData,
        template: selectedTemplate,

        education: formData.education.filter((item) =>
          Object.values(item).some((value) =>
            String(value || "").trim()
          )
        ),

        experience: formData.experience.filter((item) =>
          Object.values(item).some((value) =>
            String(value || "").trim()
          )
        ),

        projects: formData.projects.filter((item) =>
          Object.values(item).some((value) =>
            String(value || "").trim()
          )
        ),

        certifications: formData.certifications
          .map((item) => item.trim())
          .filter(Boolean),
      };

      const response = hasSavedResume
        ? await updateMyResume(cleanedData, token)
        : await saveMyResume(cleanedData, token);

      setHasSavedResume(true);

      setSaveMessage(
        response.message || "Resume saved successfully."
      );
    } catch (error) {
      console.error(
        "Resume save error:",
        error.response?.data || error.message
      );

      setSaveError(
        error.response?.data?.message ||
          "Unable to save your resume. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // DOWNLOAD ATS-FRIENDLY PDF
  // --------------------------------------------------

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF("p", "mm", "a4");

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const margin = 18;
      const contentWidth = pageWidth - margin * 2;

      let y = 20;

      const colors = {
        modern: [37, 99, 235],
        professional: [40, 40, 40],
        minimal: [0, 0, 0],
      };

      const selectedColor =
        colors[selectedTemplate] || colors.modern;

      const checkPageSpace = (height = 10) => {
        if (y + height > pageHeight - 18) {
          doc.addPage();
          y = 20;
        }
      };

      const addHeading = (heading) => {
        checkPageSpace(16);

        y += 5;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(...selectedColor);

        doc.text(heading.toUpperCase(), margin, y);

        y += 2;

        doc.setDrawColor(...selectedColor);

        doc.line(
          margin,
          y,
          pageWidth - margin,
          y
        );

        y += 7;
      };

      const addText = (value, options = {}) => {
        if (!value || !String(value).trim()) return;

        const {
          bold = false,
          fontSize = 10,
          spacing = 5,
        } = options;

        doc.setFont(
          "helvetica",
          bold ? "bold" : "normal"
        );

        doc.setFontSize(fontSize);
        doc.setTextColor(40, 40, 40);

        const lines = doc.splitTextToSize(
          String(value).trim(),
          contentWidth
        );

        checkPageSpace(lines.length * spacing + 3);

        doc.text(lines, margin, y);

        y += lines.length * spacing + 3;
      };

      // NAME

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(...selectedColor);

      const name = formData.fullName || "Your Name";

      if (selectedTemplate === "professional") {
        doc.text(name, pageWidth / 2, y, {
          align: "center",
        });
      } else {
        doc.text(name, margin, y);
      }

      y += 9;

      // CONTACT DETAILS

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(70, 70, 70);

      const contactDetails = [
        formData.email,
        formData.phone,
        formData.location,
        formData.linkedin,
        formData.github,
        formData.portfolio,
      ].filter(Boolean);

      if (contactDetails.length) {
        const contactLines = doc.splitTextToSize(
          contactDetails.join(" | "),
          contentWidth
        );

        if (selectedTemplate === "professional") {
          doc.text(
            contactLines,
            pageWidth / 2,
            y,
            { align: "center" }
          );
        } else {
          doc.text(contactLines, margin, y);
        }

        y += contactLines.length * 4 + 5;
      }

      // SUMMARY

      if (formData.summary?.trim()) {
        addHeading("Professional Summary");
        addText(formData.summary);
      }

      // SKILLS

      if (formData.skills?.trim()) {
        addHeading("Technical Skills");
        addText(formData.skills);
      }

      // EDUCATION

      if (
        formData.education.some(
          (item) => item.degree || item.institution
        )
      ) {
        addHeading("Education");

        formData.education.forEach((item) => {
          if (!item.degree && !item.institution) return;

          addText(item.degree, { bold: true });

          addText(
            [
              item.institution,
              item.year,
              item.grade,
            ]
              .filter(Boolean)
              .join(" | ")
          );
        });
      }

      // EXPERIENCE

      if (
        formData.experience.some(
          (item) =>
            item.role ||
            item.company ||
            item.description
        )
      ) {
        addHeading("Work Experience");

        formData.experience.forEach((item) => {
          if (
            !item.role &&
            !item.company &&
            !item.description
          ) {
            return;
          }

          addText(
            [item.role, item.company]
              .filter(Boolean)
              .join(" - "),
            { bold: true }
          );

          if (item.duration) {
            addText(item.duration);
          }

          if (item.description) {
            addText(item.description);
          }
        });
      }

      // PROJECTS

      if (
        formData.projects.some(
          (item) =>
            item.title ||
            item.technologies ||
            item.description
        )
      ) {
        addHeading("Projects");

        formData.projects.forEach((item) => {
          if (!item.title && !item.description) return;

          addText(item.title, { bold: true });

          if (item.technologies) {
            addText(
              `Technologies: ${item.technologies}`
            );
          }

          if (item.description) {
            addText(item.description);
          }
        });
      }

      // CERTIFICATIONS

      if (
        formData.certifications.some(
          (item) => item.trim()
        )
      ) {
        addHeading("Certifications");

        formData.certifications.forEach((item) => {
          if (item.trim()) {
            addText(`- ${item}`);
          }
        });
      }

      const safeName = (formData.fullName || "Resume")
        .replace(/[^a-z0-9]/gi, "_");

      doc.save(`${safeName}_Resume.pdf`);
    } catch (error) {
      console.error("PDF download error:", error);

      alert(
        "Unable to generate the PDF. Please try again."
      );
    }
  };

  // --------------------------------------------------
  // FORM HANDLERS
  // --------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArrayChange = (
    section,
    index,
    field,
    value
  ) => {
    setFormData((prev) => ({
      ...prev,

      [section]: prev[section].map((item, i) =>
        i === index
          ? typeof item === "string"
            ? value
            : { ...item, [field]: value }
          : item
      ),
    }));
  };

  const addItem = (section, newItem) => {
    setFormData((prev) => ({
      ...prev,
      [section]: [...prev[section], newItem],
    }));
  };

  const removeItem = (section, index) => {
    setFormData((prev) => ({
      ...prev,
      [section]: prev[section].filter(
        (_, i) => i !== index
      ),
    }));
  };

  const inputClass =
    "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

  const labelClass =
    "block text-sm font-semibold text-gray-700 mb-2";

  // --------------------------------------------------
  // MAIN UI
  // --------------------------------------------------

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-7">

        {/* HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FileText
                className="text-blue-600"
                size={26}
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Resume Builder
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Build a professional, ATS-friendly resume.
              </p>
            </div>
          </div>

          <span className="px-4 py-2 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
            ATS-Friendly Format
          </span>
        </div>

        {/* PROFILE LOADING */}

        {profileLoading && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-3">
            <RefreshCw
              size={19}
              className="animate-spin text-blue-600"
            />

            <p className="text-sm text-blue-700">
              Loading your saved profile information...
            </p>
          </div>
        )}

        {/* PROFILE MESSAGE */}

        {!profileLoading && profileMessage && (
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle
              size={19}
              className="text-green-600 shrink-0"
            />

            <p className="text-sm text-green-700">
              {profileMessage}
            </p>
          </div>
        )}

        {/* PERSONAL INFORMATION */}

        <Section
          title="Personal Information"
          icon={UserRound}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              ["fullName", "Full Name", "Enter your full name"],
              ["email", "Email Address", "Enter your email"],
              ["phone", "Phone Number", "Enter your phone number"],
              ["location", "Location", "City, State"],
              ["linkedin", "LinkedIn URL", "https://linkedin.com/in/..."],
              ["github", "GitHub URL", "https://github.com/..."],
              ["portfolio", "Portfolio URL", "Your portfolio website"],
            ].map(([name, label, placeholder]) => (
              <div key={name}>
                <label className={labelClass}>
                  {label}
                </label>

                <input
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </Section>

        {/* PROFESSIONAL SUMMARY */}

        <Section
          title="Professional Summary"
          icon={FileText}
        >
          <div>
            <label className={labelClass}>
              Career Summary
            </label>

            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              rows={5}
              placeholder="Write a short professional summary highlighting your experience, skills and career goals..."
              className={inputClass}
            />
          </div>
        </Section>

        {/* TECHNICAL SKILLS */}

        <Section
          title="Technical Skills"
          icon={Code}
        >
          <div>
            <label className={labelClass}>
              Your Skills
            </label>

            <textarea
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              rows={3}
              placeholder="React.js, JavaScript, Node.js, Express.js, MongoDB, Python..."
              className={inputClass}
            />

            <p className="text-xs text-gray-400 mt-2">
              Separate skills using commas.
            </p>
          </div>
        </Section>

        {/* EDUCATION */}

        <Section
          title="Education"
          icon={GraduationCap}
        >
          {formData.education.map((item, index) => (
            <div
              key={index}
              className="border border-gray-100 rounded-xl p-4 space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-700">
                  Education {index + 1}
                </h3>

                {formData.education.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      removeItem("education", index)
                    }
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ["degree", "Degree", "MCA, BCA, B.Tech..."],
                  ["institution", "Institution", "College or university"],
                  ["year", "Year", "2024 - 2026"],
                  ["grade", "CGPA / Percentage", "9.59 CGPA"],
                ].map(([field, label, placeholder]) => (
                  <div key={field}>
                    <label className={labelClass}>
                      {label}
                    </label>

                    <input
                      value={item[field]}
                      onChange={(e) =>
                        handleArrayChange(
                          "education",
                          index,
                          field,
                          e.target.value
                        )
                      }
                      placeholder={placeholder}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              addItem("education", {
                degree: "",
                institution: "",
                year: "",
                grade: "",
              })
            }
            className="flex items-center gap-2 text-blue-600 font-semibold text-sm"
          >
            <Plus size={18} />
            Add Education
          </button>
        </Section>

        {/* WORK EXPERIENCE */}

        <Section
          title="Work Experience"
          icon={BriefcaseBusiness}
        >
          {formData.experience.map((item, index) => (
            <div
              key={index}
              className="border border-gray-100 rounded-xl p-4 space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-700">
                  Experience {index + 1}
                </h3>

                {formData.experience.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      removeItem("experience", index)
                    }
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ["role", "Job Title", "Frontend Developer Intern"],
                  ["company", "Company", "Company name"],
                  ["duration", "Duration", "Jan 2026 - Jun 2026"],
                ].map(([field, label, placeholder]) => (
                  <div key={field}>
                    <label className={labelClass}>
                      {label}
                    </label>

                    <input
                      value={item[field]}
                      onChange={(e) =>
                        handleArrayChange(
                          "experience",
                          index,
                          field,
                          e.target.value
                        )
                      }
                      placeholder={placeholder}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className={labelClass}>
                  Responsibilities and Achievements
                </label>

                <textarea
                  rows={3}
                  value={item.description}
                  onChange={(e) =>
                    handleArrayChange(
                      "experience",
                      index,
                      "description",
                      e.target.value
                    )
                  }
                  placeholder="Describe your responsibilities and achievements..."
                  className={inputClass}
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              addItem("experience", {
                role: "",
                company: "",
                duration: "",
                description: "",
              })
            }
            className="flex items-center gap-2 text-blue-600 font-semibold text-sm"
          >
            <Plus size={18} />
            Add Experience
          </button>
        </Section>

        {/* PROJECTS */}

        <Section
          title="Projects"
          icon={FolderKanban}
        >
          {formData.projects.map((item, index) => (
            <div
              key={index}
              className="border border-gray-100 rounded-xl p-4 space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-700">
                  Project {index + 1}
                </h3>

                {formData.projects.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      removeItem("projects", index)
                    }
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <div>
                <label className={labelClass}>
                  Project Title
                </label>

                <input
                  value={item.title}
                  onChange={(e) =>
                    handleArrayChange(
                      "projects",
                      index,
                      "title",
                      e.target.value
                    )
                  }
                  placeholder="CareerPilot - AI Career Guidance Platform"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Technologies Used
                </label>

                <input
                  value={item.technologies}
                  onChange={(e) =>
                    handleArrayChange(
                      "projects",
                      index,
                      "technologies",
                      e.target.value
                    )
                  }
                  placeholder="React, Node.js, Express, MongoDB"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Project Description
                </label>

                <textarea
                  rows={3}
                  value={item.description}
                  onChange={(e) =>
                    handleArrayChange(
                      "projects",
                      index,
                      "description",
                      e.target.value
                    )
                  }
                  placeholder="Describe the project and your contributions..."
                  className={inputClass}
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              addItem("projects", {
                title: "",
                technologies: "",
                description: "",
              })
            }
            className="flex items-center gap-2 text-blue-600 font-semibold text-sm"
          >
            <Plus size={18} />
            Add Project
          </button>
        </Section>

        {/* CERTIFICATIONS */}

        <Section
          title="Certifications"
          icon={Award}
        >
          {formData.certifications.map((item, index) => (
            <div
              key={index}
              className="flex gap-3"
            >
              <input
                value={item}
                onChange={(e) =>
                  handleArrayChange(
                    "certifications",
                    index,
                    null,
                    e.target.value
                  )
                }
                placeholder="Microsoft Azure Data Fundamentals"
                className={inputClass}
              />

              {formData.certifications.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    removeItem("certifications", index)
                  }
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              addItem("certifications", "")
            }
            className="flex items-center gap-2 text-blue-600 font-semibold text-sm"
          >
            <Plus size={18} />
            Add Certification
          </button>
        </Section>

        {/* TEMPLATE SELECTION */}

        <Section
          title="Choose Resume Template"
          icon={Palette}
        >
          <p className="text-sm text-gray-500">
            Choose a professional layout. Your selection
            will be applied to the preview and downloaded PDF.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                id: "modern",
                name: "Modern",
                description:
                  "Blue accents and a contemporary layout.",
              },
              {
                id: "professional",
                name: "Professional",
                description:
                  "Traditional and formal resume layout.",
              },
              {
                id: "minimal",
                name: "Minimal",
                description:
                  "Simple black-and-white design.",
              },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setSelectedTemplate(item.id)
                }
                className={`text-left rounded-xl border-2 p-4 transition ${
                  selectedTemplate === item.id
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <div
                  className={`h-24 rounded-lg mb-3 p-3 ${
                    item.id === "modern"
                      ? "bg-blue-50 border-l-4 border-blue-600"
                      : item.id === "professional"
                      ? "bg-gray-100 border-t-2 border-gray-700"
                      : "bg-white border border-gray-300"
                  }`}
                >
                  <div
                    className={`h-2 w-1/2 rounded mb-2 ${
                      item.id === "modern"
                        ? "bg-blue-600"
                        : "bg-gray-700"
                    }`}
                  />

                  <div className="h-1.5 w-full bg-gray-300 rounded mb-2" />
                  <div className="h-1.5 w-4/5 bg-gray-300 rounded mb-2" />
                  <div className="h-1.5 w-3/5 bg-gray-300 rounded" />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-gray-800">
                    {item.name}
                  </h3>

                  {selectedTemplate === item.id && (
                    <CheckCircle
                      size={18}
                      className="text-blue-600"
                    />
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  {item.description}
                </p>
              </button>
            ))}
          </div>
        </Section>

        {/* SAVE AND DOWNLOAD */}

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="font-bold text-blue-900">
              {hasSavedResume
                ? "Your resume is saved"
                : "Save your resume"}
            </h3>

            <p className="text-sm text-blue-700 mt-1">
              Save your details securely. You can return
              later and continue editing.
            </p>
          </div>

          {saveMessage && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl p-3">
              <CheckCircle size={18} />
              {saveMessage}
            </div>
          )}

          {saveError && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
              {saveError}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSaveResume}
              disabled={
                saving ||
                profileLoading ||
                !token
              }
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {saving ? (
                <RefreshCw
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <FileText size={18} />
              )}

              {saving
                ? "Saving..."
                : hasSavedResume
                ? "Update Resume"
                : "Save Resume"}
            </button>

            <button
              type="button"
              onClick={() =>
                setShowPreview((prev) => !prev)
              }
              className="flex items-center justify-center gap-2 px-6 py-3 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl font-semibold transition"
            >
              <Eye size={18} />

              {showPreview
                ? "Hide Preview"
                : "Preview Resume"}
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold transition"
            >
              <Download size={18} />
              Download PDF
            </button>
          </div>
        </div>

        {/* LIVE PREVIEW */}

        {showPreview && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-gray-900">
                Resume Preview
              </h2>

              <span className="text-xs text-gray-500">
                {selectedTemplate.charAt(0).toUpperCase() +
                  selectedTemplate.slice(1)}{" "}
                Template · Updates as you type
              </span>
            </div>

            <ResumePreview
              data={formData}
              template={selectedTemplate}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ResumeBuilder;
