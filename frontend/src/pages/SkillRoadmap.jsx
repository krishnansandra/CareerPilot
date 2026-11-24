
import { useEffect, useState } from "react";
import {
  Brain,
  Target,
  Sparkles,
  BookOpen,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import DashboardLayout from "../layouts/DashboardLayout";
import {
  generateSkillRoadmap,
  getMySkillRoadmaps,
  updateWeeklyProgress,
} from "../services/skillRoadmapService";

function SkillRoadmap() {
  const token = localStorage.getItem("careerpilot_token");

  const [targetRole, setTargetRole] = useState("");
  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingWeek, setUpdatingWeek] = useState(null);

  // Fetch saved roadmaps
  const fetchRoadmaps = async () => {
    try {
      setLoading(true);

      const data = await getMySkillRoadmaps(token);

      setRoadmaps(data.roadmaps || []);

      if (data.roadmaps?.length > 0) {
        setSelectedRoadmap(data.roadmaps[0]);
        setTargetRole(data.roadmaps[0].targetRole);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your learning roadmaps."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  // Generate AI roadmap
  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!targetRole.trim()) {
      setError("Please enter your target job role.");
      return;
    }

    try {
      setGenerating(true);
      setError("");
      setSuccess("");

      const data = await generateSkillRoadmap(targetRole, token);

      setSelectedRoadmap(data.roadmap);

      setRoadmaps((previous) => [
        data.roadmap,
        ...previous,
      ]);

      setSuccess("Your AI learning roadmap has been generated!");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to generate your roadmap. Please try again."
      );
    } finally {
      setGenerating(false);
    }
  };

  // Update weekly progress and automatically add skills to profile
  const handleWeeklyProgress = async (weekNumber, isCompleted) => {
    try {
      const roadmapId = selectedRoadmap._id;
      const updateKey = `${roadmapId}-${weekNumber}`;

      setUpdatingWeek(updateKey);
      setError("");
      setSuccess("");

      const data = await updateWeeklyProgress(
        roadmapId,
        weekNumber,
        isCompleted,
        token
      );

      setSelectedRoadmap(data.roadmap);

      setRoadmaps((previous) =>
        previous.map((item) =>
          item._id === data.roadmap._id
            ? data.roadmap
            : item
        )
      );

      setSuccess(
        data.message ||
          "Your learning progress has been updated!"
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update learning progress."
      );
    } finally {
      setUpdatingWeek(null);
    }
  };

  // Skill gap importance styling
  const importanceStyle = (importance) => {
    if (importance === "High") {
      return "bg-red-100 text-red-700";
    }

    if (importance === "Medium") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-green-100 text-green-700";
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <RefreshCw
            className="animate-spin text-blue-600"
            size={30}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* Page Heading */}
        <div>
          <div className="mb-2 flex items-center gap-2 text-blue-600">
            <Brain size={22} />
            <span className="text-sm font-semibold">
              AI CAREER DEVELOPMENT
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Skill Gap Analysis & Learning Roadmap
          </h1>

          <p className="mt-2 text-gray-500">
            Discover the skills you need and follow a personalized
            learning plan to reach your career goals.
          </p>
        </div>

        {/* Generate Roadmap */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-800 p-7 text-white shadow-lg">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-white/15 p-3">
              <Sparkles size={25} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Create Your Learning Roadmap
              </h2>
              <p className="text-sm text-blue-100">
                Powered by Gemini AI
              </p>
            </div>
          </div>

          <form
            onSubmit={handleGenerate}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Example: Frontend Developer"
              className="min-w-0 flex-1 rounded-xl bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-300"
            />

            <button
              type="submit"
              disabled={generating}
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-blue-900 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generating ? (
                <>
                  <RefreshCw
                    size={18}
                    className="animate-spin"
                  />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate Roadmap
                </>
              )}
            </button>
          </form>
        </div>

        {/* Messages */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-red-700">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-xl bg-green-50 p-4 text-green-700">
            <CheckCircle size={20} />
            {success}
          </div>
        )}

        {/* Saved Roadmaps */}
        {roadmaps.length > 0 && (
          <div>
            <h2 className="mb-3 text-lg font-bold text-gray-900">
              Your Saved Roadmaps
            </h2>

            <div className="flex flex-wrap gap-2">
              {roadmaps.map((item) => (
                <button
                  key={item._id}
                  onClick={() => {
                    setSelectedRoadmap(item);
                    setTargetRole(item.targetRole);
                    setError("");
                    setSuccess("");
                  }}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                    selectedRoadmap?._id === item._id
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-blue-300"
                  }`}
                >
                  {item.targetRole}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Roadmap Details */}
        {selectedRoadmap ? (
          <div className="space-y-7">

            {/* Overview */}
            <div className="grid gap-5 md:grid-cols-3">

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <Target className="mb-3 text-blue-600" size={25} />
                <p className="text-sm text-gray-500">
                  Target Role
                </p>
                <h3 className="mt-1 text-lg font-bold text-gray-900">
                  {selectedRoadmap.targetRole}
                </h3>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <Clock className="mb-3 text-indigo-600" size={25} />
                <p className="text-sm text-gray-500">
                  Learning Duration
                </p>
                <h3 className="mt-1 text-lg font-bold text-gray-900">
                  {selectedRoadmap.overallDuration}
                </h3>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <BookOpen className="mb-3 text-green-600" size={25} />
                <p className="text-sm text-gray-500">
                  Learning Stages
                </p>
                <h3 className="mt-1 text-lg font-bold text-gray-900">
                  {selectedRoadmap.roadmap?.length || 0} Weeks
                </h3>
              </div>

            </div>

            {/* Current Skills */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                <CheckCircle
                  className="mr-2 inline text-green-600"
                  size={21}
                />
                Your Existing Skills
              </h2>

              <div className="flex flex-wrap gap-2">
                {selectedRoadmap.currentSkills?.length > 0 ? (
                  selectedRoadmap.currentSkills.map(
                    (skill, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-700"
                      >
                        {skill}
                      </span>
                    )
                  )
                ) : (
                  <p className="text-sm text-gray-500">
                    No existing skills identified.
                  </p>
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-2 text-xl font-bold text-gray-900">
                <Target
                  className="mr-2 inline text-orange-500"
                  size={21}
                />
                Skills You Need to Develop
              </h2>

              <p className="mb-5 text-sm text-gray-500">
                Complete your weekly learning modules to add the
                corresponding skills automatically to your Student Profile.
              </p>

              <div className="flex flex-wrap gap-3">
                {selectedRoadmap.skillGaps?.length > 0 ? (
                  selectedRoadmap.skillGaps.map((gap, index) => (
                    <div
                      key={index}
                      className="rounded-xl bg-gray-50 px-4 py-3"
                    >
                      <p className="font-semibold text-gray-800">
                        {gap.skill}
                      </p>

                      <span
                        className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${importanceStyle(
                          gap.importance
                        )}`}
                      >
                        {gap.importance} Priority
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    No skill gaps identified.
                  </p>
                )}
              </div>
            </div>

            {/* Overall Learning Progress */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                  Overall Learning Progress
                </h2>

                <span className="font-bold text-blue-600">
                  {selectedRoadmap.roadmap?.length
                    ? Math.round(
                        (selectedRoadmap.roadmap.filter(
                          (week) => week.isCompleted
                        ).length /
                          selectedRoadmap.roadmap.length) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500"
                  style={{
                    width: `${
                      selectedRoadmap.roadmap?.length
                        ? (selectedRoadmap.roadmap.filter(
                            (week) => week.isCompleted
                          ).length /
                            selectedRoadmap.roadmap.length) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>

              <p className="mt-3 text-sm text-gray-500">
                {selectedRoadmap.roadmap?.filter(
                  (week) => week.isCompleted
                ).length || 0}{" "}
                of {selectedRoadmap.roadmap?.length || 0} weeks completed
              </p>

              <p className="mt-2 text-sm font-medium text-blue-700">
                Status: {selectedRoadmap.status}
              </p>
            </div>

            {/* Weekly Learning Plan */}
            <div>
              <div className="mb-5">
                <h2 className="text-xl font-bold text-gray-900">
                  Your 4-Week Learning Plan
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Follow these weekly learning activities to improve
                  your skills.
                </p>
              </div>

              <div className="space-y-5">
                {selectedRoadmap.roadmap?.map((week) => (
                  <div
                    key={week._id || week.week}
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                  >

                    {/* Week Heading */}
                    <div className="mb-5 flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 font-bold text-blue-700">
                        W{week.week}
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                          Week {week.week}
                        </p>
                        <h3 className="text-lg font-bold text-gray-900">
                          {week.title}
                        </h3>
                      </div>
                    </div>

                    {/* Learning Topics and Tasks */}
                    <div className="grid gap-6 md:grid-cols-2">

                      <div>
                        <h4 className="mb-3 font-semibold text-gray-800">
                          Learning Topics
                        </h4>

                        <ul className="space-y-2">
                          {week.topics?.map((topic, index) => (
                            <li
                              key={index}
                              className="flex gap-2 text-sm text-gray-600"
                            >
                              <CheckCircle
                                size={17}
                                className="shrink-0 text-blue-500"
                              />
                              {topic}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="mb-3 font-semibold text-gray-800">
                          Practical Tasks
                        </h4>

                        <ul className="space-y-2">
                          {week.tasks?.map((task, index) => (
                            <li
                              key={index}
                              className="flex gap-2 text-sm text-gray-600"
                            >
                              <BookOpen
                                size={17}
                                className="shrink-0 text-indigo-500"
                              />
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>

                    {/* Skills Gained */}
                    <div className="mt-5 rounded-xl bg-indigo-50 p-4">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <h4 className="font-semibold text-indigo-900">
                          Skills You Will Gain
                        </h4>

                        {week.isCompleted && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-green-700">
                            <CheckCircle size={15} />
                            Added to Student Profile
                          </span>
                        )}
                      </div>

                      {week.skills?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {week.skills.map((skill, index) => (
                            <span
                              key={index}
                              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                                week.isCompleted
                                  ? "bg-green-100 text-green-700"
                                  : "bg-white text-indigo-700"
                              }`}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-indigo-700">
                          No specific skills were assigned to this module.
                          Generate a new roadmap to include weekly skills.
                        </p>
                      )}
                    </div>

                    {/* Expected Outcome */}
                    <div className="mt-5 rounded-xl bg-blue-50 p-4">
                      <p className="mb-1 text-sm font-semibold text-blue-800">
                        Expected Learning Outcome
                      </p>
                      <p className="text-sm text-blue-700">
                        {week.learningOutcome}
                      </p>
                    </div>

                    {/* Completion Button */}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-medium text-gray-600">
                        {week.isCompleted
                          ? "You have completed this week!"
                          : "Have you completed this week's learning tasks?"}
                      </p>

                      <button
                        onClick={() =>
                          handleWeeklyProgress(
                            week.week,
                            !week.isCompleted
                          )
                        }
                        disabled={
                          updatingWeek ===
                          `${selectedRoadmap._id}-${week.week}`
                        }
                        className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          week.isCompleted
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {updatingWeek ===
                        `${selectedRoadmap._id}-${week.week}` ? (
                          <>
                            <RefreshCw
                              size={16}
                              className="animate-spin"
                            />
                            Updating...
                          </>
                        ) : week.isCompleted ? (
                          <>
                            <CheckCircle size={17} />
                            Mark as Incomplete
                          </>
                        ) : (
                          <>
                            <CheckCircle size={17} />
                            Mark as Completed
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            <p className="text-center text-xs text-gray-400">
              AI-generated learning recommendations are advisory.
              Adjust the plan according to your learning pace and goals.
            </p>

          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <Brain
              className="mx-auto mb-4 text-blue-400"
              size={42}
            />

            <h3 className="text-lg font-bold text-gray-800">
              No Learning Roadmap Yet
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Enter your target job role above to generate your
              personalized AI learning roadmap.
            </p>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

export default SkillRoadmap;
