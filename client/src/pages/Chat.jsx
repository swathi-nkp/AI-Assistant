import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquareText,
  Plus,
  Trash2,
  Sparkles,
  Bot,
  User,
  PanelLeftClose,
  PanelLeft,
  Loader2,
  GraduationCap,
  Zap,
  Code2,
  Brain,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import ErrorMessage from '../components/ErrorMessage';
import useAuth from '../hooks/useAuth';
import { chatAPI } from '../services/api';

const TUTORING_STYLES = [
  {
    id: 'academic',
    label: 'Academic',
    sublabel: 'In-Depth Theory',
    icon: GraduationCap,
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    activeBtn: 'bg-indigo-600 text-white shadow-xs',
  },
  {
    id: 'concise',
    label: 'Concise',
    sublabel: 'High-Yield Notes',
    icon: Zap,
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    activeBtn: 'bg-amber-600 text-white shadow-xs',
  },
  {
    id: 'code',
    label: 'Code-First',
    sublabel: 'Runnable Mechanics',
    icon: Code2,
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    activeBtn: 'bg-emerald-600 text-white shadow-xs',
  },
  {
    id: 'socratic',
    label: 'Socratic',
    sublabel: 'Guided Inquiry',
    icon: Brain,
    badge: 'bg-violet-50 text-violet-700 border-violet-200',
    activeBtn: 'bg-violet-600 text-white shadow-xs',
  },
];

const PROMPT_STARTERS = [
  {
    title: 'JavaScript Closures',
    description: 'Lexical scoping, memory retention & function factories',
    prompt: 'Explain JavaScript closures with practical examples and memory mechanics.',
    icon: Code2,
    style: 'code',
  },
  {
    title: 'React useEffect Lifecycle',
    description: 'Mount/unmount, dependency arrays & stale closures',
    prompt: 'How does React useEffect handle lifecycles and cleanup to prevent memory leaks?',
    icon: Zap,
    style: 'concise',
  },
  {
    title: 'Database Normalization',
    description: '1NF, 2NF, 3NF & BCNF anomalies and table design',
    prompt: 'Explain database normalization from 1NF to BCNF with student coursework examples.',
    icon: GraduationCap,
    style: 'academic',
  },
  {
    title: 'Async/Await vs Promises',
    description: 'Event loop concurrency, microtasks & error handling',
    prompt: 'What are the architectural trade-offs between Promise.all and sequential async/await?',
    icon: Brain,
    style: 'socratic',
  },
];

const Chat = () => {
  const { user, logout } = useAuth();
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [tutoringStyle, setTutoringStyle] = useState('academic');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiMode, setAiMode] = useState('offline');

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load user's chat sessions and AI mode on mount
  useEffect(() => {
    chatAPI.getMode().then((res) => {
      if (res.data?.mode) setAiMode(res.data.mode);
    }).catch(() => {});

    const fetchChats = async () => {
      try {
        setInitialLoading(true);
        const res = await chatAPI.getChats();
        if (res.data?.success && res.data.chats) {
          setChats(res.data.chats);
          if (res.data.chats.length > 0) {
            const mostRecent = res.data.chats[0];
            setCurrentChatId(mostRecent._id);
            setMessages(mostRecent.messages || []);
            if (mostRecent.style) {
              setTutoringStyle(mostRecent.style);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load chats:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchChats();
  }, []);

  // Select a chat from sidebar
  const handleSelectChat = async (chatId) => {
    if (chatId === currentChatId) return;
    try {
      setLoading(true);
      setError('');
      const res = await chatAPI.getChatById(chatId);
      if (res.data?.success && res.data.chat) {
        setCurrentChatId(chatId);
        setMessages(res.data.chat.messages || []);
        if (res.data.chat.style) {
          setTutoringStyle(res.data.chat.style);
        }
      }
    } catch (err) {
      setError('Could not load conversation history.');
    } finally {
      setLoading(false);
    }
  };

  // Start new blank conversation
  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setError('');
  };

  // Send a message with the active tutoring style
  const handleSendMessage = async (userText, overrideStyle = null) => {
    setError('');
    const activeStyle = overrideStyle || tutoringStyle;
    const newMsg = {
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setLoading(true);

    try {
      if (!currentChatId) {
        // Create new chat session with first message and active tutoring style
        const res = await chatAPI.createChat({
          title: userText.slice(0, 32),
          message: userText,
          style: activeStyle,
        });

        if (res.data?.success && res.data.chat) {
          const newChat = res.data.chat;
          setCurrentChatId(newChat._id);
          setMessages(newChat.messages);
          setChats((prev) => [newChat, ...prev]);
        }
      } else {
        // Append to existing chat session with active tutoring style
        const res = await chatAPI.addMessage(currentChatId, {
          message: userText,
          style: activeStyle,
        });
        if (res.data?.success && res.data.chat) {
          setMessages(res.data.chat.messages);
          setChats((prev) =>
            prev.map((c) => (c._id === currentChatId ? { ...c, title: res.data.chat.title } : c))
          );
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get response from AI assistant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete chat
  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this chat conversation?')) return;

    try {
      await chatAPI.deleteChat(chatId);
      setChats((prev) => prev.filter((c) => c._id !== chatId));
      if (currentChatId === chatId) {
        handleNewChat();
      }
    } catch (err) {
      setError('Failed to delete chat.');
    }
  };

  const activeStyleObj = TUTORING_STYLES.find((s) => s.id === tutoringStyle) || TUTORING_STYLES[0];
  const ActiveIcon = activeStyleObj.icon;

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <Navbar user={user} onLogout={logout} />

      <div className="flex-1 flex overflow-hidden">
        {/* Chat History Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-72 sm:w-80' : 'w-0'
          } flex-shrink-0 bg-white border-r border-slate-200 transition-all duration-300 flex flex-col overflow-hidden`}
        >
          {/* New Chat Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleNewChat}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Study Chat</span>
            </button>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close history panel"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <div className="flex items-center justify-between px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span>Saved Conversations</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                {chats.length}
              </span>
            </div>

            {initialLoading ? (
              <div className="p-4 text-center text-xs text-slate-400">Loading history...</div>
            ) : chats.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No past chats yet. Start a new conversation!
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => handleSelectChat(chat._id)}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm cursor-pointer transition-all border ${
                    chat._id === currentChatId
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-semibold shadow-xs'
                      : 'border-transparent text-slate-700 hover:bg-slate-100/80 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <MessageSquareText
                      className={`w-4 h-4 flex-shrink-0 ${
                        chat._id === currentChatId ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'
                      }`}
                    />
                    <span className="truncate">{chat.title || 'Study Chat'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteChat(e, chat._id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-white transition-all cursor-pointer"
                    title="Delete chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Main Chat Interface */}
        <main className="flex-1 flex flex-col bg-slate-50 relative min-w-0">
          {/* Top chat header & style toolbar */}
          <div className="h-14 px-4 sm:px-6 border-b border-slate-200/80 bg-white/80 backdrop-blur-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {!sidebarOpen && (
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="p-1.5 text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0"
                  title="Open Chat History"
                >
                  <PanelLeft className="w-5 h-5" />
                </button>
              )}

              {/* Mode Badge */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                <span className="text-xs font-bold text-slate-800 hidden sm:inline">
                  {aiMode === 'offline' ? 'Offline Academic Engine' : 'OpenAI Study Tutor'}
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                  {aiMode === 'offline' ? 'Free Offline' : 'Cloud Active'}
                </span>
              </div>
            </div>

            {/* Tutoring Styles Selector Bar */}
            <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 hidden md:inline">
                Style:
              </span>
              {TUTORING_STYLES.map((style) => {
                const Icon = style.icon;
                const isActive = tutoringStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setTutoringStyle(style.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? style.activeBtn
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                    title={style.sublabel}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{style.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
            <div className="max-w-3xl mx-auto">
              {error && (
                <div className="mb-4">
                  <ErrorMessage message={error} onDismiss={() => setError('')} />
                </div>
              )}

              {messages.length === 0 ? (
                /* Empty state / Welcome state with interactive prompt cards */
                <div className="py-8 space-y-6">
                  <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-700 text-white shadow-xl shadow-indigo-100">
                      <ActiveIcon className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      AI Study Assistant & Tutor
                    </h2>
                    <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
                      Active style: <strong className="text-indigo-600">{activeStyleObj.label}</strong> ({activeStyleObj.sublabel}).
                      Select a topic below or type any question to begin:
                    </p>
                  </div>

                  {/* 4 Interactive Topic Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                    {PROMPT_STARTERS.map((card, idx) => {
                      const CardIcon = card.icon;
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            setTutoringStyle(card.style);
                            handleSendMessage(card.prompt, card.style);
                          }}
                          className="p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-indigo-300 hover:bg-indigo-50/40 transition-all cursor-pointer shadow-xs group flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <CardIcon className="w-4 h-4" />
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-indigo-600">
                                {card.style}
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {card.title}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              {card.description}
                            </p>
                          </div>

                          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-semibold">
                            <span>Ask tutor</span>
                            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Message feed */
                messages.map((msg, index) => (
                  <ChatMessage
                    key={index}
                    role={msg.role}
                    content={msg.content}
                    timestamp={msg.timestamp}
                  />
                ))
              )}

              {/* Loading Indicator */}
              {loading && (
                <div className="flex items-center gap-3 my-4">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <Sparkles className="w-4 h-4 text-amber-200" />
                  </div>
                  <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-xs flex items-center gap-2.5 text-xs text-slate-600 shadow-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    <span>AI study tutor is analyzing and formulating explanation...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 sm:p-6 bg-white border-t border-slate-200/80">
            <div className="max-w-3xl mx-auto">
              <ChatInput onSendMessage={handleSendMessage} loading={loading} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Chat;

