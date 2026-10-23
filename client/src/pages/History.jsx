import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  History as HistoryIcon,
  MessageSquareText,
  FileText,
  HelpCircle,
  Trash2,
  ExternalLink,
  Calendar,
  AlertCircle,
  Clock,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import useAuth from '../hooks/useAuth';
import { chatAPI, summaryAPI, quizAPI } from '../services/api';

const History = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' | 'summaries' | 'quizzes'
  const [chats, setChats] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllHistory();
  }, []);

  const fetchAllHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const [chatsRes, summariesRes, quizzesRes] = await Promise.all([
        chatAPI.getChats().catch(() => ({ data: { chats: [] } })),
        summaryAPI.getSummaries().catch(() => ({ data: { summaries: [] } })),
        quizAPI.getQuizzes().catch(() => ({ data: { quizzes: [] } })),
      ]);

      setChats(chatsRes.data?.chats || []);
      setSummaries(summariesRes.data?.summaries || []);
      setQuizzes(quizzesRes.data?.quizzes || []);
    } catch (err) {
      setError('Failed to fetch study history from the database.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      if (type === 'chat') {
        await chatAPI.deleteChat(id);
        setChats((prev) => prev.filter((c) => c._id !== id));
      } else if (type === 'summary') {
        await summaryAPI.deleteSummary(id);
        setSummaries((prev) => prev.filter((s) => s._id !== id));
      } else if (type === 'quiz') {
        await quizAPI.deleteQuiz(id);
        setQuizzes((prev) => prev.filter((q) => q._id !== id));
      }
    } catch (err) {
      setError(`Failed to delete ${type}. Please try again.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} onLogout={logout} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider mb-1">
            <HistoryIcon className="w-4 h-4" />
            <span>Database Archives</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Study History & Logs
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse, review, and manage your past AI conversations, condensed summaries, and scored quizzes
          </p>
        </div>

        {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('chats')}
            className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === 'chats'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquareText className="w-4 h-4" />
            <span>AI Chats ({chats.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('summaries')}
            className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === 'summaries'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Summaries ({summaries.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quizzes')}
            className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === 'quizzes'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Quizzes ({quizzes.length})</span>
          </button>
        </div>

        {/* Tab Content List */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-400">Loading history records...</div>
          ) : (
            <div>
              {/* Tab: Chats */}
              {activeTab === 'chats' && (
                <div className="space-y-3">
                  {chats.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-sm">
                      No chat conversations recorded yet. Start one on the{' '}
                      <Link to="/chat" className="text-indigo-600 underline">
                        AI Chat page
                      </Link>
                      .
                    </div>
                  ) : (
                    chats.map((c) => (
                      <div
                        key={c._id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-200 hover:bg-slate-50/60 transition-all gap-4"
                      >
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-slate-900 truncate">
                            {c.title || 'Study Chat'}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(c.createdAt).toLocaleDateString()}
                            </span>
                            <span>•</span>
                            <span>{c.messages?.length || 0} messages</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Link
                            to="/chat"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-colors"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem('chat', c._id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab: Summaries */}
              {activeTab === 'summaries' && (
                <div className="space-y-3">
                  {summaries.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-sm">
                      No note summaries created yet. Try the{' '}
                      <Link to="/summary" className="text-indigo-600 underline">
                        Note Summarizer
                      </Link>
                      .
                    </div>
                  ) : (
                    summaries.map((s) => (
                      <div
                        key={s._id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-200 hover:bg-slate-50/60 transition-all gap-4"
                      >
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-slate-900 truncate">
                            {s.title}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(s.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Link
                            to="/summary"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-colors"
                          >
                            <span>View</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem('summary', s._id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab: Quizzes */}
              {activeTab === 'quizzes' && (
                <div className="space-y-3">
                  {quizzes.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-sm">
                      No quizzes taken yet. Generate your first one on the{' '}
                      <Link to="/quiz" className="text-indigo-600 underline">
                        Quiz Generator page
                      </Link>
                      .
                    </div>
                  ) : (
                    quizzes.map((q) => (
                      <div
                        key={q._id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-200/80 hover:border-purple-200 hover:bg-slate-50/60 transition-all gap-4"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold text-slate-900 truncate">
                              {q.title}
                            </h3>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              q.difficulty === 'easy'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : q.difficulty === 'hard'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {q.difficulty || 'medium'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                              Score: {q.score} / {q.questions?.length || q.totalQuestions}
                            </span>
                            <span>•</span>
                            <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Link
                            to="/quiz"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-semibold transition-colors"
                          >
                            <span>Retake</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem('quiz', q._id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default History;
