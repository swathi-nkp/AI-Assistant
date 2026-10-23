import React, { useState } from 'react';
import {
  User,
  Sparkles,
  Copy,
  Check,
  Code2,
  Terminal,
  Lightbulb,
  Bookmark,
  AlertTriangle,
} from 'lucide-react';

/**
 * Code Block with Dark Terminal theme and dedicated copy button
 */
const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3.5 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 shadow-md">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-300 font-semibold pl-1 flex items-center gap-1">
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>{language || 'code'}</span>
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopyCode}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-colors cursor-pointer border border-slate-700/60"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <pre className="p-4 font-mono text-xs overflow-x-auto text-indigo-100 leading-relaxed selection:bg-indigo-600 selection:text-white">
        <code>{code}</code>
      </pre>
    </div>
  );
};

/**
 * Format inline tokens (**bold**, *italic*, `code`)
 */
const renderInlineTokens = (line) => {
  if (!line) return '';

  // Match inline code, bold, and italic
  const parts = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(line.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono text-[12px] font-semibold border border-indigo-100 inline-block mx-0.5"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-bold text-slate-900">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={match.index} className="italic text-slate-800">
          {token.slice(1, -1)}
        </em>
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex));
  }

  return parts;
};

/**
 * Formatted Paragraph parser for structured lines
 */
const FormattedParagraph = ({ text }) => {
  const lines = text.split('\n');

  return (
    <div className="space-y-1.5 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Header 3
        if (trimmed.startsWith('### ')) {
          return (
            <h3
              key={idx}
              className="text-base sm:text-lg font-bold text-slate-900 tracking-tight pt-3 pb-1 border-b border-slate-100 flex items-center gap-2"
            >
              <span>{renderInlineTokens(trimmed.slice(4))}</span>
            </h3>
          );
        }

        // Header 4
        if (trimmed.startsWith('#### ')) {
          return (
            <h4
              key={idx}
              className="text-sm sm:text-base font-bold text-indigo-900 pt-2 pb-0.5 flex items-center gap-1.5"
            >
              <span>{renderInlineTokens(trimmed.slice(5))}</span>
            </h4>
          );
        }

        // Horizontal Divider
        if (trimmed === '---') {
          return <hr key={idx} className="my-3 border-slate-200/80" />;
        }

        // Callout: Exam Key Takeaway (📌)
        if (trimmed.startsWith('📌')) {
          return (
            <div
              key={idx}
              className="my-3 p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 text-indigo-950 text-xs shadow-xs flex items-start gap-2.5"
            >
              <Bookmark className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">
                {renderInlineTokens(trimmed.slice(2).trim())}
              </div>
            </div>
          );
        }

        // Callout: Tip or Insight (💡)
        if (trimmed.startsWith('💡')) {
          return (
            <div
              key={idx}
              className="my-3 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-950 text-xs shadow-xs flex items-start gap-2.5"
            >
              <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">
                {renderInlineTokens(trimmed.slice(2).trim())}
              </div>
            </div>
          );
        }

        // Callout: Warning / Caution (⚠️)
        if (trimmed.startsWith('⚠️')) {
          return (
            <div
              key={idx}
              className="my-3 p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200/80 text-rose-950 text-xs shadow-xs flex items-start gap-2.5"
            >
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">
                {renderInlineTokens(trimmed.slice(2).trim())}
              </div>
            </div>
          );
        }

        // Bullet Point
        if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2 text-sm text-slate-800 pl-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0 mt-2"></span>
              <span className="flex-1 leading-relaxed">
                {renderInlineTokens(trimmed.slice(2))}
              </span>
            </div>
          );
        }

        // Numbered List (1. , 2. )
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-800 pl-1">
              <span className="w-5 h-5 rounded-lg bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {numMatch[1]}
              </span>
              <span className="flex-1 leading-relaxed">
                {renderInlineTokens(numMatch[2])}
              </span>
            </div>
          );
        }

        // Regular Text Line
        return (
          <p key={idx} className="text-sm text-slate-800 leading-relaxed">
            {renderInlineTokens(line)}
          </p>
        );
      })}
    </div>
  );
};

/**
 * Split text by fenced code blocks (```...```) and render recursively
 */
const renderRichContent = (rawText) => {
  if (!rawText) return null;

  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(rawText)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: rawText.slice(lastIndex, match.index),
      });
    }
    parts.push({
      type: 'code',
      language: match[1] || 'code',
      code: match[2].trim(),
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < rawText.length) {
    parts.push({
      type: 'text',
      content: rawText.slice(lastIndex),
    });
  }

  return (
    <div className="space-y-2">
      {parts.map((part, pIdx) => {
        if (part.type === 'code') {
          return <CodeBlock key={pIdx} language={part.language} code={part.code} />;
        }
        return <FormattedParagraph key={pIdx} text={part.content} />;
      })}
    </div>
  );
};

const ChatMessage = ({ role, content, timestamp }) => {
  const [copied, setCopied] = useState(false);
  const isUser = role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={`flex gap-3.5 my-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start group`}>
      {/* Avatar Icon */}
      <div
        className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs ${
          isUser
            ? 'bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white ring-2 ring-indigo-200'
            : 'bg-gradient-to-tr from-violet-600 via-indigo-600 to-indigo-700 text-white ring-2 ring-purple-200 shadow-sm'
        }`}
      >
        {isUser ? <User className="w-5 h-5" /> : <Sparkles className="w-4 h-4 text-amber-200" />}
      </div>

      {/* Message Bubble Container */}
      <div className={`max-w-[90%] sm:max-w-[82%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-xs font-semibold text-slate-600">
            {isUser ? 'You' : 'AI Study Tutor'}
          </span>
          {formattedTime && <span className="text-[10px] text-slate-400">{formattedTime}</span>}
        </div>

        <div
          className={`relative p-4 sm:p-5 rounded-3xl text-sm leading-relaxed ${
            isUser
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-xs shadow-md shadow-indigo-100 whitespace-pre-wrap'
              : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs shadow-xs'
          }`}
        >
          {isUser ? content : renderRichContent(content)}

          {/* Assistant Action Footer */}
          {!isUser && (
            <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span>Verified Study Tutor Explanation</span>
              </span>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200/60"
                title="Copy entire explanation"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 text-[11px] font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Copy Notes</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;

