import { useState, useRef, useEffect } from 'react';
import API from '../api/axios';
import MarkdownRenderer from '../components/MarkdownRenderer';

const presetQuestions = [
  'Analyze my current spending',
  'How much budget do I have left?',
  'Where did I spend the most this month?',
  'How can I save money next month?'
];

const AIChatPage = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I am your FinTrack AI Assistant. I have analyzed your spending data for this month. Ask me anything about your expenses, category breakdown, or how to save more money!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const messageText = textToSend || input;
    if (!messageText.trim() || loading) return;

    setInput('');
    setError('');
    
    // Add user message to state
    const updatedMessages = [...messages, { role: 'user', content: messageText }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const response = await API.post('/ai-chat', { messages: updatedMessages });
      // Add assistant message to state
      setMessages((prev) => [...prev, { role: 'assistant', content: response.data.message }]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get a response from your AI assistant. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] lg:h-[calc(100vh-64px)] max-w-4xl mx-auto space-y-4 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-text-primary">AI Chat Assistant</h1>
        <p className="text-text-muted text-sm mt-1">Get personalized financial coaching and recommendations</p>
      </div>

      {/* Main Chat Card */}
      <div className="flex-1 glass-card flex flex-col overflow-hidden min-h-0">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 max-w-[85%] md:max-w-[75%] ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-semibold shadow-md ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-accent-emerald to-accent-emerald-dark text-white'
                    : 'bg-gradient-to-br from-accent-purple to-accent-blue text-white'
                }`}
              >
                {msg.role === 'user' ? '👤' : '✨'}
              </div>

              {/* Message Bubble */}
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed border animate-slideUp ${
                  msg.role === 'user'
                    ? 'bg-accent-emerald/8 border-accent-emerald/20 text-text-primary rounded-tr-none'
                    : 'bg-bg-primary/40 border-white/5 text-text-primary rounded-tl-none'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <MarkdownRenderer content={msg.content} />
                ) : (
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator / Shimmer */}
          {loading && (
            <div className="flex items-start gap-3 max-w-[75%] mr-auto">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-purple to-accent-blue text-white flex items-center justify-center text-sm shadow-md animate-pulse">
                ✨
              </div>
              <div className="p-4 rounded-2xl bg-bg-primary/40 border border-white/5 rounded-tl-none space-y-2 w-48">
                <div className="skeleton h-3 w-full rounded" />
                <div className="skeleton h-3 w-4/5 rounded" />
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-xl bg-accent-rose/10 border border-accent-rose/20 text-accent-rose-light text-sm max-w-lg mx-auto flex items-center gap-3 animate-shake">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold">Chat failed</p>
                <p className="text-xs text-text-muted mt-0.5">{error}</p>
              </div>
              <button
                onClick={() => handleSend(messages[messages.length - 1]?.content)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-accent-rose/15 hover:bg-accent-rose/25 text-accent-rose-light border border-accent-rose/25"
              >
                Retry
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length === 1 && (
          <div className="px-6 pb-4 flex flex-wrap gap-2 animate-fadeIn justify-center">
            {presetQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="text-xs py-2 px-3.5 rounded-full border border-white/5 bg-bg-primary/30 text-text-secondary hover:text-text-primary hover:border-accent-purple/30 hover:bg-accent-purple/5 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {q} ➔
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 border-t border-white/5 bg-bg-secondary/40">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your budget, expenses, or financial advice..."
              disabled={loading}
              className="glass-input flex-1 py-3 text-sm focus:border-accent-purple/50 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-primary py-3 px-5 bg-gradient-to-r from-accent-purple to-accent-blue shadow-lg shadow-accent-purple/10 hover:shadow-accent-purple/20 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIChatPage;
