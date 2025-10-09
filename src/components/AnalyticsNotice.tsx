import { useEffect, useState } from 'react';

type AnalyticsNoticeProps = {
  onClose?: () => void;
};

export default function AnalyticsNotice({ onClose }: AnalyticsNoticeProps) {
  const [visible, setVisible] = useState(false);
  const analyticsEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';

  useEffect(() => {
    if (!analyticsEnabled) return;
    try {
      const seen = localStorage.getItem('analytics_notice_seen') === 'true';
      const optedOut = localStorage.getItem('analytics_opt_out') === 'true';
      if (!seen && !optedOut) {
        setVisible(true);
      }
    } catch {
      // no-op
    }
  }, [analyticsEnabled]);

  if (!visible) return null;

  const handleOptOut = () => {
    try {
      localStorage.setItem('analytics_opt_out', 'true');
    } catch {
      // no-op
    }
    setVisible(false);
    onClose?.();
    // Reload to ensure analytics stays disabled for this session
    try { window.location.reload(); } catch { /* no-op */ }
  };

  const handleDismiss = () => {
    try { localStorage.setItem('analytics_notice_seen', 'true'); } catch { /* no-op */ }
    setVisible(false);
    onClose?.();
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[90%] rounded-xl shadow-2xl bg-white border border-gray-200 p-4">
      <div className="text-sm text-gray-700">
        Analytics are enabled. We use PostHog to collect anonymous usage data to improve the app. You can opt out anytime.
      </div>
      <div className="mt-3 flex gap-2 justify-end">
        <a
          href="https://github.com/aruntemme/bento-generator/blob/main/PRIVACY.md"
          target="_blank"
          rel="noreferrer"
          className="text-sm px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800"
        >
          Privacy
        </a>
        <button
          onClick={handleDismiss}
          className="text-sm px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800"
        >
          Dismiss
        </button>
        <button
          onClick={handleOptOut}
          className="text-sm px-3 py-1.5 rounded-md bg-gray-900 hover:bg-black text-white"
        >
          Opt out
        </button>
      </div>
    </div>
  );
}


