import { useState } from 'react';
import API from '../api/axios';

const SmartInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchInsights = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/ai-advisor');
      setInsights(res.data.tips || res.data.insights || res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tipIcons = ['💡', '✨', '🎯', '📊', '🔍'];
  const tipColors = [
    { bg: 'bg-accent-amber/8', border: 'border-accent-amber/15', text: 'text-accent-amber-light' },
    { bg: 'bg-accent-emerald/8', border: 'border-accent-emerald/15', text: 'text-accent-emerald-light' },
    { bg: 'bg-accent-blue/8', border: 'border-accent-blue/15', text: 'text-accent-blue-light' },
    { bg: 'bg-accent-purple/8', border: 'border-accent-purple/15', text: 'text-accent-purple-light' },
    { bg: 'bg-accent-rose/8', border: 'border-accent-rose/15', text: 'text-accent-rose-light' },
  ];

  return (
    <div className="glass-card p-6 animate-slideUp border-accent-purple/10">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-lg font-bold text-text-primary flex items-center gap-2">
          <svg className="w-5 h-5 text-accent-purple" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
          </svg>
          AI Insights
        </h3>
        {insights && (
          <button
            onClick={fetchInsights}
            disabled={loading}
            className="text-xs text-accent-purple-light hover:text-accent-purple font-medium transition-colors"
          >
            Refresh
          </button>
        )}
      </div>

      {/* Initial State — Button */}
      {!insights && !loading && !error && (
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 flex items-center justify-center animate-pulse-glow">
            <svg className="w-8 h-8 text-accent-purple-light" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
            </svg>
          </div>
          <p className="text-text-secondary text-sm mb-4">Get personalized tips from AI based on your spending</p>
          <button
            onClick={fetchInsights}
            className="bg-gradient-to-r from-accent-purple to-accent-blue text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-accent-purple/20 hover:shadow-accent-purple/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
            </svg>
            Get AI Insights ✨
          </button>
        </div>
      )}

      {/* Loading Shimmer */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-bg-tertiary/10 border border-white/5">
              <div className="flex items-start gap-3">
                <div className="skeleton w-8 h-8 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-2/5 rounded" />
                  <div className="skeleton h-3 w-full rounded" />
                  <div className="skeleton h-3 w-3/4 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-accent-rose/10 flex items-center justify-center">
            <svg className="w-7 h-7 text-accent-rose" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <p className="text-accent-rose-light text-sm mb-4">{error}</p>
          <button onClick={fetchInsights} className="btn-ghost text-sm">
            Try Again
          </button>
        </div>
      )}

      {/* Tips */}
      {insights && !loading && (
        <div className="space-y-3">
          {(Array.isArray(insights) ? insights : [insights]).slice(0, 5).map((tip, idx) => {
            const colors = tipColors[idx % tipColors.length];
            const icon = tipIcons[idx % tipIcons.length];
            const title = typeof tip === 'string' ? `Tip ${idx + 1}` : (tip.title || `Tip ${idx + 1}`);
            const description = typeof tip === 'string' ? tip : (tip.description || tip.text || tip.tip || JSON.stringify(tip));

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl ${colors.bg} border ${colors.border} animate-slideUp`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0 mt-0.5">{icon}</span>
                  <div>
                    <h4 className={`font-semibold text-sm ${colors.text} mb-1`}>{title}</h4>
                    <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SmartInsights;
