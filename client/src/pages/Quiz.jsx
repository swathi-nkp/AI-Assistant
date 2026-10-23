import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Award,
  Zap,
  Target,
  Flame,
  Layers,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import useAuth from '../hooks/useAuth';
import { quizAPI } from '../services/api';

const getDifficultyBadge = (level) => {
  const norm = String(level || 'medium').toLowerCase();
  switch (norm) {
    case 'easy':
      return {
        label: 'Easy Section',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        color: 'text-emerald-600',
        icon: Zap,
      };
    case 'hard':
      return {
        label: 'Hard Section',
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
        color: 'text-rose-600',
        icon: Flame,
      };
    case 'medium':
    default:
      return {
        label: 'Medium Section',
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        color: 'text-amber-600',
        icon: Target,
      };
  }
};

const Quiz = () => {
  const { user, logout } = useAuth();
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [difficulty, setDifficulty] = useState('medium'); // 'easy' | 'medium' | 'hard'
  const [numQuestions, setNumQuestions] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Active quiz state
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Generate a new quiz with specific difficulty section
  const handleGenerateQuiz = async (e, forcedDifficulty = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const activeDifficulty = forcedDifficulty || difficulty;

    if (!topic.trim() && !content.trim()) {
      setError('Please provide a study topic or notes to generate quiz questions.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setIsSubmitted(false);
      setSelectedAnswers({});
      setCurrentQuestionIndex(0);

      const res = await quizAPI.generateQuiz({
        title: topic.trim() || 'Interactive Study Quiz',
        content: content.trim(),
        numQuestions,
        difficulty: activeDifficulty,
      });

      if (res.data?.success && res.data.quiz) {
        setCurrentQuiz(res.data.quiz);
        if (forcedDifficulty) {
          setDifficulty(forcedDifficulty);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Option selection handler
  const handleSelectOption = (optionIndex) => {
    if (isSubmitted) return; // Prevent changing after submission
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
  };

  // Submit quiz and calculate score
  const handleSubmitQuiz = async () => {
    if (!currentQuiz || !currentQuiz.questions) return;

    let totalScore = 0;
    currentQuiz.questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        totalScore += 1;
      }
    });

    setScore(totalScore);
    setIsSubmitted(true);

    // Save final score to MongoDB
    try {
      await quizAPI.saveScore(currentQuiz._id, { score: totalScore });
    } catch (err) {
      console.warn('Could not save quiz score to backend:', err);
    }
  };

  const handleReset = () => {
    setCurrentQuiz(null);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setCurrentQuestionIndex(0);
    setScore(0);
  };

  const currentBadge = getDifficultyBadge(currentQuiz?.difficulty || difficulty);
  const CurrentBadgeIcon = currentBadge.icon;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} onLogout={logout} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="text-center sm:text-left">
          <div className="inline-flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider mb-1">
            <HelpCircle className="w-4 h-4" />
            <span>Active Recall Generator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Interactive Quiz Generator
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Test your comprehension across <strong>Easy</strong>, <strong>Medium</strong>, and <strong>Hard</strong> difficulty sections
          </p>
        </div>

        {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

        {!currentQuiz ? (
          /* Step 1: Input study content & select difficulty section */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <form onSubmit={handleGenerateQuiz} className="space-y-5">
              {/* Topic Title */}
              <div>
                <label
                  htmlFor="topic"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Quiz Subject / Topic Title
                </label>
                <input
                  id="topic"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. JavaScript Closures, React Hooks, or Data Structures"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  required
                />
              </div>

              {/* Three Difficulty Sections Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                  Select Difficulty Section
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Section 1: Easy */}
                  <button
                    type="button"
                    onClick={() => setDifficulty('easy')}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col gap-1.5 cursor-pointer ${
                      difficulty === 'easy'
                        ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        difficulty === 'easy' ? 'text-emerald-800' : 'text-slate-700'
                      }`}>
                        <Zap className="w-4 h-4 text-emerald-500" />
                        <span>Easy Section</span>
                      </span>
                      {difficulty === 'easy' && (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Core definitions, fundamental syntax & introductory principles.
                    </p>
                  </button>

                  {/* Section 2: Medium */}
                  <button
                    type="button"
                    onClick={() => setDifficulty('medium')}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col gap-1.5 cursor-pointer ${
                      difficulty === 'medium'
                        ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/20 shadow-xs'
                        : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        difficulty === 'medium' ? 'text-amber-800' : 'text-slate-700'
                      }`}>
                        <Target className="w-4 h-4 text-amber-500" />
                        <span>Medium Section</span>
                      </span>
                      {difficulty === 'medium' && (
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Practical code application, common pitfalls & pattern analysis.
                    </p>
                  </button>

                  {/* Section 3: Hard */}
                  <button
                    type="button"
                    onClick={() => setDifficulty('hard')}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col gap-1.5 cursor-pointer ${
                      difficulty === 'hard'
                        ? 'border-rose-500 bg-rose-50/80 ring-2 ring-rose-500/20 shadow-xs'
                        : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        difficulty === 'hard' ? 'text-rose-800' : 'text-slate-700'
                      }`}>
                        <Flame className="w-4 h-4 text-rose-500" />
                        <span>Hard Section</span>
                      </span>
                      {difficulty === 'hard' && (
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Deep edge cases, runtime engine internals & system trade-offs.
                    </p>
                  </button>
                </div>
              </div>

              {/* Study Notes (Optional) */}
              <div>
                <label
                  htmlFor="content"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Study Material Notes (Optional, for tailored questions)
                </label>
                <textarea
                  id="content"
                  rows="5"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste lecture notes, textbook passages, or code snippets to generate context-specific questions..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  icon={Sparkles}
                  className="w-full sm:w-auto"
                >
                  Generate {difficulty.toUpperCase()} Section Quiz
                </Button>

                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  3 interactive multiple-choice questions
                </span>
              </div>
            </form>
          </div>
        ) : !isSubmitted ? (
          /* Step 2: Interactive Quiz Taking View */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            {/* Quiz Progress Header with Section Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${currentBadge.badge}`}>
                    <CurrentBadgeIcon className="w-3 h-3" />
                    <span>{currentBadge.label}</span>
                  </span>
                  <span className="text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                    {currentQuiz.title}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
                </p>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Change Section / Reset</span>
              </button>
            </div>

            {/* Question Text */}
            <div className="space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {currentQuiz.questions[currentQuestionIndex].question}
              </h2>

              {/* 4 Options Grid */}
              <div className="space-y-3 pt-2">
                {currentQuiz.questions[currentQuestionIndex].options.map((option, idx) => {
                  const isSelected = selectedAnswers[currentQuestionIndex] === idx;
                  const optionLetters = ['A', 'B', 'C', 'D'];

                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className={`flex items-center gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs'
                          : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-100 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white border border-slate-300 text-slate-600'
                        }`}
                      >
                        {optionLetters[idx]}
                      </div>
                      <span className="text-sm font-medium leading-relaxed">{option}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>

              {currentQuestionIndex < currentQuiz.questions.length - 1 ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  disabled={selectedAnswers[currentQuestionIndex] === undefined}
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSubmitQuiz}
                  disabled={selectedAnswers[currentQuestionIndex] === undefined}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Submit & Score Quiz
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* Step 3: Quiz Results & Score Breakdown */
          <div className="space-y-6 animate-in fade-in">
            {/* Score Summary Card */}
            <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 rounded-3xl p-8 text-white text-center shadow-lg shadow-indigo-100">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md mb-4">
                <Award className="w-8 h-8 text-amber-300" />
              </div>
              <div className="flex justify-center mb-2">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border bg-white/15 text-white border-white/25 backdrop-blur-xs`}>
                  <CurrentBadgeIcon className="w-3.5 h-3.5" />
                  <span>{currentBadge.label} Completed</span>
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Your Score: {score} / {currentQuiz.questions.length}
              </h2>
              <p className="mt-2 text-indigo-100 text-sm">
                Mastery Level: {Math.round((score / currentQuiz.questions.length) * 100)}% • Result recorded in database
              </p>

              {/* Quick Section Switchers */}
              <div className="mt-6 pt-5 border-t border-white/15">
                <p className="text-xs uppercase tracking-wider font-semibold text-indigo-200 mb-3">
                  Practice other difficulty sections for this topic:
                </p>
                <div className="flex flex-wrap justify-center gap-2.5">
                  {['easy', 'medium', 'hard'].map((sec) => {
                    const secBadge = getDifficultyBadge(sec);
                    const isCurrent = sec === (currentQuiz.difficulty || difficulty);
                    return (
                      <button
                        key={sec}
                        type="button"
                        disabled={loading}
                        onClick={() => handleGenerateQuiz(null, sec)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-white text-indigo-900 shadow-xs'
                            : 'bg-white/15 hover:bg-white/25 text-white'
                        }`}
                      >
                        <secBadge.icon className="w-3.5 h-3.5" />
                        <span>{sec.toUpperCase()} Section</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 flex justify-center gap-3">
                <Button variant="secondary" size="md" onClick={handleReset} icon={RotateCcw}>
                  New Topic / Custom Quiz
                </Button>
              </div>
            </div>

            {/* Answer Breakdown Review */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">
                  Question Breakdown & Review
                </h3>
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${currentBadge.badge}`}>
                  <CurrentBadgeIcon className="w-3 h-3" />
                  <span>{currentBadge.label}</span>
                </span>
              </div>

              <div className="space-y-6">
                {currentQuiz.questions.map((q, qIndex) => {
                  const userAnswer = selectedAnswers[qIndex];
                  const isCorrect = userAnswer === q.correctAnswer;

                  return (
                    <div
                      key={qIndex}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {qIndex + 1}. {q.question}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                        <div
                          className={`p-3 rounded-xl border ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                              : 'bg-rose-50 border-rose-200 text-rose-900'
                          }`}
                        >
                          <span className="font-bold">Your Answer: </span>
                          {q.options[userAnswer] !== undefined ? q.options[userAnswer] : 'Not answered'}
                        </div>
                        {!isCorrect && (
                          <div className="p-3 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-900">
                            <span className="font-bold">Correct Answer: </span>
                            {q.options[q.correctAnswer]}
                          </div>
                        )}
                      </div>

                      {q.explanation && (
                        <p className="text-xs text-slate-500 bg-white p-3 rounded-xl border border-slate-200/60 leading-relaxed">
                          💡 <strong>Explanation:</strong> {q.explanation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Quiz;

