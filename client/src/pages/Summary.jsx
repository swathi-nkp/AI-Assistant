import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Trash2,
  Clock,
  BookOpen,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import useAuth from '../hooks/useAuth';
import { summaryAPI } from '../services/api';

const Summary = () => {
  const { user, logout } = useAuth();
  const [title, setTitle] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [summaryResult, setSummaryResult] = useState('');
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedSummaryId, setSelectedSummaryId] = useState(null);

  // Load previous summaries on mount
  useEffect(() => {
    fetchSavedSummaries();
  }, []);

  const fetchSavedSummaries = async () => {
    try {
      setFetchLoading(true);
      const res = await summaryAPI.getSummaries();
      if (res.data?.success && res.data.summaries) {
        setSummaries(res.data.summaries);
      }
    } catch (err) {
      console.error('Failed to load summaries:', err);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSummarize = async (e) => {
    e.preventDefault();
    if (!title.trim() || !originalText.trim()) {
      setError('Please provide a title and paste some study notes to summarize.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await summaryAPI.createSummary({
        title: title.trim(),
        originalText: originalText.trim(),
      });

      if (res.data?.success && res.data.summary) {
        const newSummary = res.data.summary;
        setSummaryResult(newSummary.summary);
        setSelectedSummaryId(newSummary._id);
        setSummaries((prev) => [newSummary, ...prev]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPrevious = (item) => {
    setSelectedSummaryId(item._id);
    setTitle(item.title);
    setOriginalText(item.originalText);
    setSummaryResult(item.summary);
    setError('');
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this saved summary?')) return;

    try {
      await summaryAPI.deleteSummary(id);
      setSummaries((prev) => prev.filter((s) => s._id !== id));
      if (selectedSummaryId === id) {
        setSummaryResult('');
        setSelectedSummaryId(null);
      }
    } catch (err) {
      setError('Failed to delete summary.');
    }
  };

  const handleCopySummary = () => {
    if (!summaryResult) return;
    navigator.clipboard.writeText(summaryResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setTitle('');
    setOriginalText('');
    setSummaryResult('');
    setSelectedSummaryId(null);
    setError('');
  };

  const charCount = originalText.length;
  const wordCount = originalText.trim() ? originalText.trim().split(/\s+/).length : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} onLogout={logout} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider mb-1">
              <FileText className="w-4 h-4" />
              <span>AI Study Note Condenser</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Summarize Study Notes
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Turn long lecture transcripts, book chapters, or articles into concise key takeaways
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleClear} icon={RefreshCw}>
              New Summary
            </Button>
          </div>
        </div>

        {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

        {/* Workspace Dual Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form & Input Area (7 cols on lg) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <form onSubmit={handleSummarize} className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Topic / Document Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. CS101: Operating Systems & Virtual Memory"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="notes"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                  >
                    Original Notes / Study Text
                  </label>
                  <span className="text-xs text-slate-400 font-medium">
                    {wordCount} words • {charCount} chars
                  </span>
                </div>
                <textarea
                  id="notes"
                  rows="12"
                  value={originalText}
                  onChange={(e) => setOriginalText(e.target.value)}
                  placeholder="Paste your lecture notes, textbook excerpt, or draft study material here..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans leading-relaxed resize-y"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={loading}
                  icon={Sparkles}
                >
                  Generate AI Summary
                </Button>
              </div>
            </form>
          </div>

          {/* Right Column: AI Output & Previous Summaries (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Generated Summary Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col min-h-[380px]">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    AI Condensed Summary
                  </h3>
                </div>

                {summaryResult && (
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {summaryResult ? (
                <div className="flex-1 overflow-y-auto max-h-[420px] pr-2 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                  {summaryResult}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
                  <BookOpen className="w-10 h-10 text-slate-300" />
                  <p className="text-sm">
                    Your condensed study summary will appear here once generated.
                  </p>
                </div>
              )}
            </div>

            {/* Saved Summaries List */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
                Saved Summaries ({summaries.length})
              </h4>

              {fetchLoading ? (
                <p className="text-xs text-slate-400 p-2">Loading saved summaries...</p>
              ) : summaries.length === 0 ? (
                <p className="text-xs text-slate-400 p-2">No summaries saved yet.</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {summaries.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => handleSelectPrevious(item)}
                      className={`group flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedSummaryId === item._id
                          ? 'border-indigo-400 bg-indigo-50/50 text-indigo-900 font-semibold'
                          : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <p className="truncate font-medium">{item.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, item._id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Summary;
