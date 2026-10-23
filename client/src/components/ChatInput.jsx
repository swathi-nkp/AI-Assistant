import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, CornerDownLeft } from 'lucide-react';

const ChatInput = ({ onSendMessage, loading, placeholder = 'Ask a question or paste code to explain...' }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  // Quick starter questions for quick learning
  const suggestionChips = [
    'Explain JavaScript closures',
    'What is React useEffect lifecycle?',
    'Database Normalization (1NF to BCNF)',
    'Explain the Event Loop in Node.js',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChipClick = (chipText) => {
    setInput(chipText);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* Suggestion Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none text-xs">
        <span className="text-slate-400 font-medium whitespace-nowrap flex items-center gap-1 pl-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Prompts:
        </span>
        {suggestionChips.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleChipClick(chip)}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition-colors whitespace-nowrap border border-slate-200/60"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Main Input Box */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-2xl border border-slate-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 shadow-xs transition-all"
      >
        <textarea
          ref={textareaRef}
          rows="2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={loading}
          className="w-full px-4 py-3 pr-24 rounded-2xl resize-none text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
        />

        <div className="absolute right-2 bottom-2 flex items-center gap-1.5">
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="inline-flex items-center justify-center p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
            title="Send message (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
      <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
        <span>Press <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for new line</span>
        <span>AI Study Tutor v1.0</span>
      </div>
    </div>
  );
};

export default ChatInput;
