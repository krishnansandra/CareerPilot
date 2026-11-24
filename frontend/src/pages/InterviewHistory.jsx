
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Brain,
  Trophy,
  Clock,
  CalendarDays,
  Play,
  Eye,
  RefreshCw,
  Loader2,
  AlertCircle,
  Target,
} from "lucide-react";

import { getInterviewHistory } from "../services/interviewService";

function InterviewHistory() {
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getInterviewHistory();

      setInterviews(response.interviews || []);
    } catch (err) {
      console.error("Interview history error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your interview history."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const completedInterviews = interviews.filter(
    (item) => item.status === "Completed"
  );

  const inProgressInterviews = interviews.filter(
    (item) => item.status === "In Progress"
  );

  const averageScore =
    completedInterviews.length > 0
      ? (
          completedInterviews.reduce(
            (total, item) => total + (item.overallScore || 0),
            0
          ) / completedInterviews.length
        ).toFixed(2)
      : "0.00";

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleOpenInterview = (interview) => {
    navigate("/student/interview-preparation", {
      state: {
        interviewId: interview._id,
      },
    });
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <h3 className="text-2xl font-bold text-[#111C35] mt-2">
            {value}
          </h3>
        </div>

        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={23} />
        </div>
      </div>
    </div>
  );

  return (
    
  <div className="w-full max-w-6xl mx-auto">
    <div className="space-y-7"></div> 
     
        {/* Header */}
        <div className="bg-gradient-to-r from-[#111C35] to-blue-700 rounded-3xl p-7 md:p-9 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center mb-4">
                <Brain size={27} />
              </div>

              <h1 className="text-2xl md:text-3xl font-bold">
                Your Interview Journey
              </h1>

              <p className="text-blue-100 mt-2 max-w-2xl">
                Track your mock interviews, review AI feedback and
                continue practising to improve your performance.
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/student/interview-preparation")
              }
              className="bg-white text-blue-700 hover:bg-blue-50 px-5 py-3 rounded-xl font-semibold transition"
            >
              Start New Interview
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard
            icon={Brain}
            label="Total Interviews"
            value={interviews.length}
            color="bg-blue-50 text-blue-600"
          />

          <StatCard
            icon={Trophy}
            label="Completed"
            value={completedInterviews.length}
            color="bg-green-50 text-green-600"
          />

          <StatCard
            icon={Clock}
            label="In Progress"
            value={inProgressInterviews.length}
            color="bg-orange-50 text-orange-600"
          />

          <StatCard
            icon={Target}
            label="Average Score"
            value={`${averageScore}/10`}
            color="bg-purple-50 text-purple-600"
          />
        </div>

        {/* Interview List */}
        
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="flex flex-wrap items-center justify-between gap-3 p-6 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-[#111C35]">
                Previous Interviews
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Your saved interview sessions
              </p>
            </div>

            <button
              onClick={loadHistory}
              disabled={loading}
              className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2
                size={35}
                className="animate-spin text-blue-600"
              />
              <p className="text-slate-500 mt-4">
                Loading interview history...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-14 px-5">
              <AlertCircle
                size={38}
                className="text-red-500 mx-auto mb-3"
              />

              <p className="text-red-600 font-medium">{error}</p>

              <button
                onClick={loadHistory}
                className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
          ) : interviews.length === 0 ? (
            <div className="text-center py-16 px-5">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                <Brain size={30} />
              </div>

              <h3 className="text-lg font-bold text-[#111C35]">
                No Interviews Yet
              </h3>

              <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                Start your first AI mock interview to practise
                questions and receive personalized feedback.
              </p>

              <button
                onClick={() =>
                  navigate("/student/interview-preparation")
                }
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold"
              >
                Start Your First Interview
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {interviews.map((interview) => {
                const isCompleted =
                  interview.status === "Completed";

                const progress =
                  interview.questions?.length > 0
                    ? Math.round(
                        (interview.completedQuestions /
                          interview.questions.length) *
                          100
                      )
                    : 0;

                return (
                  <div
                    key={interview._id}
                    className="p-6 hover:bg-slate-50/70 transition"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <h3 className="text-lg font-bold text-[#111C35]">
                            {interview.targetRole}
                          </h3>

                          <span
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                              isCompleted
                                ? "bg-green-50 text-green-700"
                                : "bg-orange-50 text-orange-700"
                            }`}
                          >
                            {interview.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                          <span>{interview.interviewType}</span>
                          <span>{interview.difficulty}</span>

                          <span className="flex items-center gap-1">
                            <CalendarDays size={15} />
                            {formatDate(interview.createdAt)}
                          </span>

                          <span>
                            {interview.completedQuestions || 0}/
                            {interview.questions?.length || 0} Questions
                          </span>
                        </div>

                        {!isCompleted && (
                          <div className="mt-4 max-w-md">
                            <div className="flex justify-between text-xs text-slate-500 mb-2">
                              <span>Interview Progress</span>
                              <span>{progress}%</span>
                            </div>

                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {isCompleted ? (
                          <>
                            <div className="text-right mr-2">
                              <p className="text-xs text-slate-500">
                                Overall Score
                              </p>

                              <p className="text-2xl font-bold text-blue-600">
                                {interview.overallScore ?? "—"}
                                <span className="text-sm text-slate-400">
                                  /10
                                </span>
                              </p>
                            </div>

                            <button
                              onClick={() =>
                                handleOpenInterview(interview)
                              }
                              className="flex items-center gap-2 bg-[#111C35] hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition"
                            >
                              <Eye size={16} />
                              View Feedback
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() =>
                              handleOpenInterview(interview)
                            }
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition"
                          >
                            <Play size={16} />
                            Resume Interview
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
   
  );
}

export default InterviewHistory;
