import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineIndicator() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="bg-amber-100 border-b border-amber-300 px-4 py-1.5 flex items-center gap-2 text-amber-800 text-sm no-print" role="alert">
      <WifiOff className="w-4 h-4" />
      <span>You are offline — cached content is available</span>
    </div>
  );
}
