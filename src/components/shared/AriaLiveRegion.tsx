import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface AriaLiveContextValue {
  announce: (message: string) => void;
}

const AriaLiveContext = createContext<AriaLiveContextValue>({ announce: () => {} });

export function useAriaLive() {
  return useContext(AriaLiveContext);
}

export function AriaLiveProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('');

  const announce = useCallback((msg: string) => {
    setMessage('');
    // Force re-render so screen reader picks up new content
    requestAnimationFrame(() => setMessage(msg));
  }, []);

  return (
    <AriaLiveContext value={{ announce }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {message}
      </div>
    </AriaLiveContext>
  );
}
