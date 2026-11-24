
import { useState, useEffect } from "react";

import {
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Target,
  TrendingUp,
  Lightbulb,
  Brain,
  Download,
  RefreshCw,
  BriefcaseBusiness,
  MapPin,
  X,
} from "lucide-react";

import DashboardLayout from "../layouts/DashboardLayout";

import {
  uploadResume,
  analyzeResume,
  downloadResume,
  getMyResume,
  getRecommendedJobs,
   getSavedResumeAnalysis,
} from "../services/resumeService";

import { useAuth } from "../context/AuthContext";

function Resume() {
  const { token } = useAuth();

  const [file, setFile] = useState(null);
  const [resume, setResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  const [recommendations, setRecommendations] = useState([]);
  const [hasFetchedRecommendations, setHasFetchedRecommendations] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] =
    useState(false);

  const [resumeLoading, setResumeLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch previously uploaded resume
  useEffect(() => {
  const fetchResumeData = async () => {
    try {
      // Load uploaded resume
      const resumeResponse = await getMyResume(token);
      const savedResume = resumeResponse.resume || null;

      setResume(savedResume);

      // Load saved AI analysis if a resume exists
      if (savedResume) {
        try {
          const analysisResponse =
            await getSavedResumeAnalysis(token);

          setAnalysis(analysisResponse.analysis || null);
        } catch (analysisError) {
          if (analysisError.response?.status !== 404) {
            console.error(
              "Unable to load saved analysis:",
              analysisError
            );
          }

          setAnalysis(null);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your saved resume."
      );
    } finally {
      setResumeLoading(false);
    }
  };

  if (token) {
    fetchResumeData();
  } else {
    setResumeLoading(false);
  }
}, [token]);

  // Select PDF file
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    setError("");
    setMessage("");

    if (!selectedFile) return;

    if (
      selectedFile.type !== "application/pdf" ||
      !selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please select a valid PDF file.");
      setFile(null);
      e.target.value = "";
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size must not exceed 5 MB.");
      setFile(null);
      e.target.value = "";
      return;
    }

    setFile(selectedFile);
  };

  // Upload or replace resume
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a PDF resume first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await uploadResume(file, token);

      setResume(
        response.resume ||
          response.data?.resume ||
          response.data
      );

      // Clear previous analysis and recommendations
      setAnalysis(null);
      setRecommendations([]);
      setHasFetchedRecommendations(false);

      setShowUpload(false);

      setMessage(
        response.message || "Resume uploaded successfully!"
      );

      setFile(null);
      e.target.reset();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to upload resume."
      );
    } finally {
      setLoading(false);
    }
  };

  // Download saved resume
  const handleDownload = async () => {
    try {
      setDownloading(true);
      setError("");

      const blob = await downloadResume(token);

      const url = window.URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" })
      );

      const link = document.createElement("a");

      link.href = url;
      link.download = resume?.fileName || "My_Resume.pdf";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to download resume."
      );
    } finally {
      setDownloading(false);
    }
  };

  // Analyze resume using Gemini AI
  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      setError("");
      setMessage("");

      const response = await analyzeResume(token);

      setAnalysis(response.analysis);

      // Do not clear job recommendations here.
      // Analysis and job matching are independent.

      setMessage(
        response.message || "Resume analyzed successfully!"
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to analyze resume."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  // Find jobs using uploaded resume
  // This does not require Gemini analysis
  const handleGetRecommendations = async () => {
    try {
      setLoadingRecommendations(true);
      setError("");
      setMessage("");

      const response = await getRecommendedJobs(token);

      setRecommendations(response.recommendations || []);
      setHasFetchedRecommendations(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load job recommendations."
      );
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // Analysis section component
  const AnalysisSection = ({ title, icon: Icon, items }) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Icon className="text-blue-600" size={20} />
          </div>

          <h3 className="font-bold text-gray-800">{title}</h3>
        </div>

        <ul className="space-y-3">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex items-start gap-3 text-sm text-gray-600"
            >
              <CheckCircle
                size={16}
                className="text-green-500 mt-0.5 shrink-0"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Score colors
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";

    return "text-red-600";
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-blue-600";
    if (percentage >= 40) return "bg-yellow-500";

    return "bg-red-500";
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Page Heading */}
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FileText className="text-blue-600" size={26} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                My Resume
              </h1>

              <p className="text-gray-500 text-sm mt-1">
                Manage your resume and discover career opportunities.
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {message && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
            <CheckCircle size={20} />
            <p className="text-sm font-medium">{message}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Loading Saved Resume */}
        {resumeLoading ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <RefreshCw
              className="animate-spin text-blue-600 mx-auto mb-3"
              size={28}
            />

            <p className="text-gray-500">
              Loading your saved resume...
            </p>
          </div>
        ) : (
          <>
            {/* Upload Resume */}
            {(!resume || showUpload) && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Upload className="text-blue-600" size={22} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-gray-800">
                        {resume
                          ? "Replace Your Resume"
                          : "Upload Your Resume"}
                      </h2>

                      <p className="text-sm text-gray-500">
                        PDF format · Maximum 5 MB
                      </p>
                    </div>
                  </div>

                  {resume && showUpload && (
                    <button
                      onClick={() => {
                        setShowUpload(false);
                        setFile(null);
                        setError("");
                        setMessage("");
                      }}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                      title="Cancel replacement"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>

                <form onSubmit={handleUpload}>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-blue-200 rounded-xl p-8 cursor-pointer hover:bg-blue-50 transition">
                    <Upload
                      size={32}
                      className="text-blue-600 mb-3"
                    />

                    <span className="font-semibold text-gray-700">
                      Choose your resume
                    </span>

                    <span className="text-sm text-gray-400 mt-1">
                      Select a PDF file from your device
                    </span>

                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  {file && (
                    <div className="mt-4 flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                      <FileText
                        className="text-blue-600"
                        size={24}
                      />

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">
                          {file.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>

                      <CheckCircle
                        className="text-green-500"
                        size={20}
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!file || loading}
                    className="mt-5 w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                  >
                    {loading
                      ? "Uploading..."
                      : resume
                      ? "Replace Resume"
                      : "Upload Resume"}
                  </button>
                </form>
              </div>
            )}

            {/* Existing Saved Resume */}
            {resume && !showUpload && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-xl">
                      <FileText
                        className="text-green-600"
                        size={30}
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-gray-800">
                          My Uploaded Resume
                        </h2>

                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                          Saved
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mt-1">
                        {resume.fileName}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        {resume.uploadedAt
                          ? `Uploaded: ${new Date(
                              resume.uploadedAt
                            ).toLocaleDateString()}`
                          : "Your resume is saved"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleDownload}
                      disabled={downloading}
                      className="flex items-center justify-center gap-2 px-5 py-3 border border-blue-200 text-blue-600 rounded-xl hover:bg-blue-50 disabled:opacity-50"
                    >
                      <Download size={18} />

                      {downloading
                        ? "Downloading..."
                        : "Download"}
                    </button>

                    <button
                      onClick={() => {
                        setShowUpload(true);
                        setFile(null);
                        setError("");
                        setMessage("");
                      }}
                      className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                    >
                      <RefreshCw size={18} />
                      Replace Resume
                    </button>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-gray-100">
                  <button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:bg-gray-400 transition"
                  >
                    {analyzing ? (
                      <>
                        <RefreshCw
                          size={18}
                          className="animate-spin"
                        />
                        Analyzing Resume...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        {analysis
                          ? "Analyze Again"
                          : "Analyze My Resume"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* AI Analysis Results - Independent Section */}
        {analysis && (
          <div className="space-y-6">

            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Brain className="text-purple-600" size={25} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  AI Resume Analysis
                </h2>

                <p className="text-sm text-gray-500">
                  Your resume evaluation powered by Gemini AI.
                </p>
              </div>
            </div>

            {/* Overall Score */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="text-center">
                  <p className="text-sm text-gray-500 font-medium">
                    Overall Resume Score
                  </p>

                  <div className="mt-3">
                    <span
                      className={`text-6xl font-bold ${getScoreColor(
                        analysis.score
                      )}`}
                    >
                      {analysis.score}
                    </span>

                    <span className="text-2xl text-gray-400">
                      /100
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 mt-2">
                    AI Evaluation Score
                  </p>
                </div>

                <div className="md:col-span-2">
                  <h3 className="font-bold text-gray-800 mb-2">
                    Resume Summary
                  </h3>

                  <p className="text-gray-600 text-sm leading-7">
                    {analysis.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Score Breakdown */}
            {analysis.scoreBreakdown?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="text-blue-600" size={22} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      Resume Score Breakdown
                    </h2>

                    <p className="text-sm text-gray-500">
                      Understand how your resume was evaluated.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {analysis.scoreBreakdown.map((item) => {
                    const percentage =
                      (item.score / item.maxScore) * 100;

                    return (
                      <div key={item.category}>
                        <div className="flex justify-between items-center mb-2 gap-3">
                          <span className="font-medium text-gray-700 text-sm">
                            {item.label}
                          </span>

                          <span className="text-sm font-semibold text-blue-600">
                            {item.score}/{item.maxScore}
                          </span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`${getProgressColor(
                              percentage
                            )} h-2.5 rounded-full transition-all duration-500`}
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>

                        <p className="text-sm text-gray-500 mt-2">
                          {item.feedback}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Analysis Details */}
            <AnalysisSection
              title="Resume Strengths"
              icon={TrendingUp}
              items={analysis.strengths}
            />

            <AnalysisSection
              title="Areas to Improve"
              icon={AlertCircle}
              items={analysis.weaknesses}
            />

            <AnalysisSection
              title="Technical Skills Identified"
              icon={Brain}
              items={analysis.technicalSkills}
            />

            <AnalysisSection
              title="Soft Skills Identified"
              icon={CheckCircle}
              items={analysis.softSkills}
            />

            <AnalysisSection
              title="Missing Skills"
              icon={Target}
              items={analysis.missingSkills}
            />

            <AnalysisSection
              title="AI Improvement Suggestions"
              icon={Lightbulb}
              items={analysis.suggestions}
            />

            <AnalysisSection
              title="Suggested Career Roles"
              icon={Sparkles}
              items={analysis.suitableJobRoles}
            />

            <p className="text-xs text-gray-400 text-center">
              AI-generated feedback is advisory and should not be
              treated as a hiring decision.
            </p>
          </div>
        )}

        {/* Find Matching Jobs - Independent of AI Analysis */}
        {resume && !showUpload && (
          <div className="space-y-6">

            {/* Job Recommendations Button */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <BriefcaseBusiness
                    className="text-indigo-600"
                    size={24}
                  />
                </div>

                <div>
                  <h2 className="font-bold text-gray-800">
                    Find Suitable Jobs
                  </h2>

                  <p className="text-sm text-gray-500">
                    Discover open jobs matching your uploaded resume skills.
                    No new AI resume analysis is required.
                  </p>
                </div>
              </div>

              <button
                onClick={handleGetRecommendations}
                disabled={loadingRecommendations}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:bg-gray-400 transition"
              >
                {loadingRecommendations ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw size={18} className="animate-spin" />
                    Finding Suitable Jobs...
                  </span>
                ) : (
                  "Find Jobs Matching My Resume"
                )}
              </button>
            </div>

            {/* Recommended Jobs */}
            {hasFetchedRecommendations && (
              <div className="space-y-5">

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Recommended Jobs For You
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Jobs ranked according to the skills found in your resume.
                  </p>

                  <p className="text-sm text-indigo-600 font-medium mt-2">
                    {recommendations.length} job opportunities found
                  </p>
                </div>

                {recommendations.length > 0 ? (
                  recommendations.map((item) => (
                    <div
                      key={item.job._id}
                      className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
                    >

                      {/* Job Information */}
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">
                            {item.job.title}
                          </h3>

                          <p className="text-gray-500 mt-1">
                            {item.job.companyName}
                          </p>

                          <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                            <MapPin size={15} />
                            {item.job.location || "Location not specified"}
                          </p>
                        </div>

                        <div className="bg-blue-50 rounded-xl px-5 py-3 text-center min-w-32">
                          <p className="text-3xl font-bold text-blue-600">
                            {item.matchPercentage}%
                          </p>

                          <p className="text-xs text-gray-500">
                            Skill Match
                          </p>
                        </div>
                      </div>

                      {/* Match Level */}
                      <div className="mt-5">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            item.matchPercentage >= 80
                              ? "bg-green-100 text-green-700"
                              : item.matchPercentage >= 60
                              ? "bg-blue-100 text-blue-700"
                              : item.matchPercentage >= 40
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.matchLevel || "Match evaluated"}
                        </span>
                      </div>

                      {/* Match Progress Bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium text-gray-700">
                            Skills Compatibility
                          </span>

                          <span className="font-semibold text-gray-600">
                            {item.matchPercentage}%
                          </span>
                        </div>

                        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`${getProgressColor(
                              item.matchPercentage
                            )} h-full rounded-full transition-all duration-500`}
                            style={{
                              width: `${item.matchPercentage}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Match Explanation */}
                      <div className="mt-5 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                        <h4 className="font-semibold text-indigo-900 text-sm flex items-center gap-2">
                          <Sparkles size={17} />
                          Why this job is recommended
                        </h4>

                        <p className="text-sm text-indigo-800 mt-2 leading-6">
                          {item.matchExplanation ||
                            "This job has been evaluated against the skills in your resume."}
                        </p>
                      </div>

                      {/* Matched Skills */}
                      <div className="mt-5">
                        <h4 className="font-semibold text-gray-700 text-sm mb-3">
                          <span className="text-green-600">✓</span> Matched Skills
                        </h4>

                        <div className="flex flex-wrap gap-2">
                          {item.matchedSkills?.length > 0 ? (
                            item.matchedSkills.map((skill, index) => (
                              <span
                                key={index}
                                className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-100 rounded-full text-xs font-medium"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <p className="text-sm text-gray-400">
                              No matching skills found.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Missing Skills */}
                      <div className="mt-5">
                        <h4 className="font-semibold text-gray-700 text-sm mb-3">
                          <span className="text-red-500">!</span> Missing Skills
                        </h4>

                        <div className="flex flex-wrap gap-2">
                          {item.missingSkills?.length > 0 ? (
                            item.missingSkills.map((skill, index) => (
                              <span
                                key={index}
                                className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-100 rounded-full text-xs font-medium"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <p className="text-sm text-green-600">
                              You have all the specified required skills!
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Improvement Suggestions */}
                      {item.improvementSuggestions?.length > 0 && (
                        <div className="mt-5 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                          <h4 className="font-semibold text-amber-900 text-sm flex items-center gap-2">
                            <Lightbulb size={18} />
                            Skills Improvement Suggestions
                          </h4>

                          <ul className="mt-3 space-y-2">
                            {item.improvementSuggestions.map(
                              (suggestion, index) => (
                                <li
                                  key={index}
                                  className="text-sm text-amber-800 flex gap-2"
                                >
                                  <span>•</span>
                                  <span>{suggestion}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                    <BriefcaseBusiness
                      size={35}
                      className="text-gray-300 mx-auto mb-3"
                    />

                    <h3 className="font-semibold text-gray-700">
                      No open jobs available
                    </h3>

                    <p className="text-sm text-gray-500 mt-2">
                      There are currently no open jobs to compare with your resume.
                    </p>
                  </div>
                )}
              </div>
            )}

            <p className="text-xs text-gray-400 text-center">
              AI-generated feedback and skill-match scores are
              advisory and should not be treated as hiring decisions.
            </p>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

export default Resume;
