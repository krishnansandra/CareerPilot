
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import {
  Sparkles,
  Brain,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Trophy,
  Target,
  RefreshCw,
} from "lucide-react";

import {
  generateInterview,
  submitInterviewAnswer,
  getInterviewById,
} from "../services/interviewService";

function InterviewPreparation() {
  const location = useLocation();
  const interviewId = location.state?.interviewId;

  const [targetRole, setTargetRole] = useState("");
  const [interviewType, setInterviewType] = useState("Technical");
  const [difficulty, setDifficulty] = useState("Intermediate");

  const [interview, setInterview] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingSavedInterview, setLoadingSavedInterview] =
    useState(Boolean(interviewId));
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  // Load an existing interview from Interview History
  useEffect(() => {
    if (!interviewId) return;

    const loadSavedInterview = async () => {
      try {
        setLoadingSavedInterview(true);
        setError("");

        const data = await getInterviewById(interviewId);
        const savedInterview = data.interview || data;

        setInterview(savedInterview);
        setTargetRole(savedInterview.targetRole || "");
        setInterviewType(savedInterview.interviewType || "Technical");
        setDifficulty(savedInterview.difficulty || "Intermediate");

        // Resume from the first unanswered question.
        // Completed interviews open from the first question for review.
        const nextUnansweredIndex =
          savedInterview.questions.findIndex(
            (question) =>
              !question.answer?.trim() && !question.answeredAt
          );

        const selectedIndex =
          nextUnansweredIndex === -1 ? 0 : nextUnansweredIndex;

        setCurrentIndex(selectedIndex);
        setAnswer(
          savedInterview.questions[selectedIndex]?.answer || ""
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load this interview. Please try again."
        );
      } finally {
        setLoadingSavedInterview(false);
      }
    };

    loadSavedInterview();
  }, [interviewId]);

  // Generate a new interview
  const handleGenerate = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setInterview(null);
      setCurrentIndex(0);
      setAnswer("");

      const data = await generateInterview({
        targetRole,
        interviewType,
        difficulty,
      });

      setInterview(data.interview);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to generate interview. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Submit and evaluate the current answer
  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      setError("Please enter your answer before submitting.");
      return;
    }

    if (currentQuestion?.answer) {
      setError("This question has already been answered.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const data = await submitInterviewAnswer({
        interviewId: interview._id,
        questionIndex: currentIndex,
        answer,
      });

      setInterview((previous) => ({
        ...previous,
        questions: previous.questions.map((question, index) =>
          index === currentIndex
            ? {
                ...question,
                answer,
                score: data.evaluation.score,
                feedback: data.evaluation.feedback,
                strengths: data.evaluation.strengths,
                improvements: data.evaluation.improvements,
                answeredAt:
                  data.evaluation.answeredAt || new Date(),
              }
            : question
        ),
        completedQuestions: data.completedQuestions,
        status: data.status,
        overallScore: data.overallScore,
        overallFeedback: data.overallFeedback,
      }));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to evaluate your answer. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Move to the next question
  const handleNext = () => {
    if (
      currentIndex < interview.questions.length - 1 &&
      currentQuestion?.answer
    ) {
      const nextIndex = currentIndex + 1;

      setCurrentIndex(nextIndex);
      setAnswer(interview.questions[nextIndex].answer || "");
      setError("");
    }
  };

  // Move to the previous question
  const handlePrevious = () => {
    if (currentIndex > 0) {
      const previousIndex = currentIndex - 1;

      setCurrentIndex(previousIndex);
      setAnswer(interview.questions[previousIndex].answer || "");
      setError("");
    }
  };

  // Start a fresh interview
  const handleStartAnother = () => {
    setInterview(null);
    setTargetRole("");
    setInterviewType("Technical");
    setDifficulty("Intermediate");
    setCurrentIndex(0);
    setAnswer("");
    setError("");
  };

  const currentQuestion = interview?.questions?.[currentIndex];

  const isCompleted = interview?.status === "Completed";
  const hasAnswered = Boolean(currentQuestion?.answer?.trim());

  // Show loading while retrieving a saved interview
  if (loadingSavedInterview) {
    return (
        
      <div className="min-h-screen bg-[#F7F8FC] flex items-center justify-center ">
        <div className="text-center">
          <Loader2
            size={38}
            className="animate-spin text-blue-600 mx-auto mb-4"
          />
          <p className="text-slate-600 font-medium">
            Loading your saved interview...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div p-6 md:p-10 max-w-7xl mx-auto>
    <div className="space-y-6">
      {/* Interview Setup */}
      {!interview && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-[#111C35] to-blue-700 rounded-3xl p-8 md:p-10 text-white mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-5">
              <Brain size={30} />
            </div>

            <h1 className="text-3xl font-bold mb-3">
              Prepare for Your Next Interview
            </h1>

            <p className="text-blue-100 leading-relaxed">
              Generate personalized interview questions, practise
              your answers and receive AI-powered feedback to improve
              your interview performance.
            </p>
          </div>

          <form
            onSubmit={handleGenerate}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 space-y-6"
          >
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Target Job Role
              </label>

              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Frontend Developer"
                required
                className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Interview Type
              </label>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["Technical", "HR", "Behavioral", "Mixed"].map(
                  (type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setInterviewType(type)}
                      className={`py-3 rounded-xl border text-sm font-medium transition ${
                        interviewType === type
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-slate-300 text-slate-600 hover:border-blue-400"
                      }`}
                    >
                      {type}
                    </button>
                  )
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Difficulty Level
              </label>

              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl py-3.5 transition"
            >
              {loading ? (
                <>
                  <Loader2 size={19} className="animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <Sparkles size={19} />
                  Generate AI Interview
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Interview Progress and Questions */}
      {interview && currentQuestion && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Interview Progress */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex flex-wrap justify-between gap-4 mb-5">
              <div>
                <p className="text-sm text-slate-500">Target Role</p>

                <h2 className="text-xl font-bold text-[#111C35]">
                  {interview.targetRole}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {interview.interviewType} · {interview.difficulty}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-slate-500">
                  Completed Questions
                </p>

                <p className="text-2xl font-bold text-blue-600">
                  {interview.completedQuestions || 0}/
                  {interview.questions.length}
                </p>
              </div>
            </div>

            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{
                  width: `${
                    ((interview.completedQuestions || 0) /
                      interview.questions.length) *
                    100
                  }%`,
                }}
              />
            </div>

            {isCompleted && (
              <p className="text-sm text-green-700 font-medium mt-4">
                Interview completed — you are reviewing your saved answers.
              </p>
            )}
          </div>

          {/* Current Question */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-semibold text-blue-600">
                QUESTION {currentIndex + 1} OF{" "}
                {interview.questions.length}
              </span>

              <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
                {interview.interviewType}
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-[#111C35] leading-relaxed mb-7">
              {currentQuestion.question}
            </h2>

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Your Answer
            </label>

            <textarea
              rows={7}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={hasAnswered || submitting || isCompleted}
              placeholder="Write your answer here..."
              className="w-full border border-slate-300 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500 resize-y disabled:bg-slate-50"
            />

            {error && (
              <p className="text-sm text-red-600 mt-3">{error}</p>
            )}

            {!hasAnswered && !isCompleted && (
              <button
                onClick={handleSubmitAnswer}
                disabled={submitting || !answer.trim()}
                className="mt-5 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Submit Answer
                  </>
                )}
              </button>
            )}

            {/* Saved AI Evaluation */}
            {hasAnswered && (
              <div className="mt-7 bg-blue-50 border border-blue-100 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#111C35]">
                    AI Evaluation
                  </h3>

                  <span className="text-2xl font-bold text-blue-700">
                    {currentQuestion.score ?? "—"}/10
                  </span>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed">
                  {currentQuestion.feedback ||
                    "No feedback is available for this answer."}
                </p>

                <div className="grid md:grid-cols-2 gap-5 mt-5">
                  <div>
                    <h4 className="font-semibold text-green-700 text-sm mb-2">
                      Strengths
                    </h4>

                    {currentQuestion.strengths?.length > 0 ? (
                      currentQuestion.strengths.map((item, index) => (
                        <p
                          key={index}
                          className="text-sm text-slate-600 mb-2"
                        >
                          ✓ {item}
                        </p>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">
                        No strengths recorded.
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-orange-700 text-sm mb-2">
                      Areas to Improve
                    </h4>

                    {currentQuestion.improvements?.length > 0 ? (
                      currentQuestion.improvements.map(
                        (item, index) => (
                          <p
                            key={index}
                            className="text-sm text-slate-600 mb-2"
                          >
                            • {item}
                          </p>
                        )
                      )
                    ) : (
                      <p className="text-sm text-slate-500">
                        No improvement suggestions recorded.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Question Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 text-slate-600 hover:text-blue-600 disabled:opacity-30"
              >
                <ArrowLeft size={18} />
                Previous
              </button>

              <button
                onClick={handleNext}
                disabled={
                  !hasAnswered ||
                  currentIndex === interview.questions.length - 1
                }
                className="flex items-center gap-2 bg-[#111C35] text-white px-5 py-2.5 rounded-xl disabled:opacity-30"
              >
                Next Question
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final Interview Report */}
      {isCompleted && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-12 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
            <Trophy size={40} />
          </div>

          <h2 className="text-3xl font-bold text-[#111C35]">
            Interview Completed!
          </h2>

          <p className="text-slate-500 mt-3">
            Congratulations on completing your AI mock interview.
          </p>

          <div className="my-8">
            <p className="text-sm text-slate-500">Overall Score</p>

            <p className="text-6xl font-bold text-blue-600 mt-2">
              {interview.overallScore ?? "—"}
              <span className="text-2xl text-slate-400">/10</span>
            </p>
          </div>

          <div className="bg-blue-50 rounded-2xl p-6 text-left">
            <h3 className="font-bold text-[#111C35] mb-2">
              Overall Feedback
            </h3>

            <p className="text-sm text-slate-700 leading-relaxed">
              {interview.overallFeedback ||
                "Your final report is being prepared."}
            </p>
          </div>

          <div className="mt-6 text-sm text-slate-500">
            <Target size={17} className="inline mr-2" />
            {interview.targetRole} · {interview.interviewType}
          </div>

          <p className="text-sm text-slate-500 mt-4">
            You can use the Previous and Next buttons above to review
            each question and its AI evaluation.
          </p>

          <button
            onClick={handleStartAnother}
            className="mt-8 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3 rounded-xl"
          >
            <RefreshCw size={18} />
            Start Another Interview
          </button>
        </div>
      )}
    </div>
    </div>
  );
}

export default InterviewPreparation;
