import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquareText,
  FileText,
  HelpCircle,
  Sparkles,
  Clock,
  ArrowRight,
  Flame,
  Award,
  BookOpen,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import FeatureCard from '../components/FeatureCard';
import useAuth from '../hooks/useAuth';
import { userAPI, chatAPI, summaryAPI, quizAPI } from '../services/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    chatCount: 0,
    summaryCount: 0,
    quizCount: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Parallel requests for aggregated data
        const [profileRes, chatsRes, summariesRes, quizzesRes] = await Promise.all([
          userAPI.getProfile().catch(() => ({ data: { stats: { chatCount: 0, summaryCount: 0, quizCount: 0 } } })),
          chatAPI.getChats().catch(() => ({ data: { chats: [] } })),
          summaryAPI.getSummaries().catch(() => ({ data: { summaries: [] } })),
          quizAPI.getQuizzes().catch(() => ({ data: { quizzes: [] } })),
        ]);

        if (profileRes.data?.stats) {
          setStats(profileRes.data.stats);
        }

        // Combine into unified recent activity timeline
        const acts = [];
        const rawChats = chatsRes.data?.chats || [];
        const rawSummaries = summariesRes.data?.summaries || [];
        const rawQuizzes = quizzesRes.data?.quizzes || [];

        rawChats.slice(0, 3).forEach((c) => {
          acts.push({
            id: `chat-${c._id}`,
            title: c.title || 'AI Chat Session',
            time: new Date(c.createdAt).toLocaleDateString(),
            rawDate: new Date(c.createdAt),
            badge: 'AI Chat',
            badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            link: '/chat',
          });
        });

        rawSummaries.slice(0, 3).forEach((s) => {
          acts.push({
            id: `summary-${s._id}`,
            title: s.title || 'Note Summary',
            time: new Date(s.createdAt).toLocaleDateString(),
            rawDate: new Date(s.createdAt),
            badge: 'Summary',
            badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            link: '/summary',
          });
        });

        rawQuizzes.slice(0, 3).forEach((q) => {
          acts.push({
            id: `quiz-${q._id}`,
            title: q.title || 'Practice Quiz',
            time: new Date(q.createdAt).toLocaleDateString(),
            rawDate: new Date(q.createdAt),
            badge: `${q.difficulty ? q.difficulty.toUpperCase() + ' • ' : ''}Score: ${q.score}/${q.questions?.length || q.totalQuestions}`,
            badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
            link: '/quiz',
          });
        });

        // Sort descending by date
        acts.sort((a, b) => b.rawDate - a.rawDate);
        setRecentActivities(acts.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      label: 'AI Chat Sessions',
      value: stats.chatCount.toString(),
      change: 'Conversations in MongoDB',
      icon: MessageSquareText,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Notes Summarized',
      value: stats.summaryCount.toString(),
      change: 'Saved study notes',
      icon: FileText,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Quizzes Completed',
      value: stats.quizCount.toString(),
      change: 'Active recall tests',
      icon: HelpCircle,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Study Motivation',
      value: 'Level 1',
      change: 'Active Learner',
      icon: Flame,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <Navbar user={user} onLogout={logout} />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 text-white p-6 sm:p-10 shadow-lg shadow-indigo-100">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 -mb-10 w-48 h-48 bg-violet-400/20 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-4 text-indigo-100 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Full-Stack AI Study Suite • MERN</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Student'} 👋
            </h1>
            <p className="mt-2 text-indigo-100 text-sm sm:text-base leading-relaxed max-w-2xl">
              Ready to learn faster today? Ask study doubts to your AI tutor, condense dense textbook chapters, or test your retention with custom quizzes.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-700 font-semibold text-sm hover:bg-indigo-50 shadow-sm transition-all"
              >
                <MessageSquareText className="w-4 h-4" />
                <span>Start AI Chat</span>
              </Link>
              <Link
                to="/summary"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-medium text-sm backdrop-blur-md border border-white/20 transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>Summarize Notes</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats Metric Cards */}
        <section>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {statCards.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex items-start justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {stat.label}
                    </p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                      {stat.value}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      {stat.change}
                    </p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Core AI Study Tools */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              AI Study Tools
            </h2>
            <p className="text-sm text-slate-500">
              Choose a specialized assistant tool to accelerate your coursework
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              title="AI Chat Tutor"
              description="Ask complex technical questions, request step-by-step code walkthroughs, or get instant explanations in plain English."
              icon={MessageSquareText}
              badge="Conversational"
              to="/chat"
              gradient="from-indigo-600 to-indigo-700"
              btnText="Open AI Chat"
            />

            <FeatureCard
              title="Summarize Notes"
              description="Paste raw lecture transcripts, dense article paragraphs, or chapters to extract structured bullet points and key takeaways."
              icon={FileText}
              badge="Time Saver"
              to="/summary"
              gradient="from-emerald-500 to-teal-600"
              btnText="Condense Notes"
            />

            <FeatureCard
              title="Quiz Generator"
              description="Transform your study material into interactive 4-option multiple choice questions with instant scoring and explanations."
              icon={HelpCircle}
              badge="Active Recall"
              to="/quiz"
              gradient="from-purple-500 to-pink-600"
              btnText="Take a Quiz"
            />
          </div>
        </section>

        {/* Recent Study Activity & Strategy */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* Recent Activity List */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Recent Study Activity
                </h3>
              </div>
              <Link
                to="/history"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline inline-flex items-center gap-1"
              >
                <span>View Full History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <p className="text-sm text-slate-400 p-4 text-center">Loading recent activity...</p>
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No recent activity recorded yet. Try starting a chat or summarizing a note!
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-100 group"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                      <Link
                        to={item.link}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Open item"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Exam Prep Strategy */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 rounded-3xl p-6 sm:p-7 border border-amber-200/60 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center mb-4 shadow-sm">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Exam Prep Strategy
              </span>
              <h4 className="text-lg font-bold text-slate-900 mt-1 mb-2">
                Feynman Technique
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                "If you can't explain it simply, you don't understand it well enough." Use the <strong>AI Chat</strong> to teach back concepts or ask it to quiz you on points you're unsure about.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-amber-200/50">
              <Link
                to="/quiz"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <span>Test your retention now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p>© 2026 AI Study Assistant • Built with MERN Stack & Tailwind CSS</p>
      </footer>
    </div>
  );
};

export default Dashboard;
