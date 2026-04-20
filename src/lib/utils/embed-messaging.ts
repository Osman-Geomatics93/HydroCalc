/**
 * PostMessage-based communication for embeds.
 * Parent page can send `hydro:setParams` messages.
 * Embed posts `hydro:ready` when loaded.
 */
export function initEmbedMessaging(): () => void {
  // Notify parent we're ready
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'hydro:ready' }, '*');
  }

  // Listen for param updates from parent
  const handler = (event: MessageEvent) => {
    if (event.data?.type === 'hydro:setParams' && typeof event.data.params === 'object') {
      const url = new URL(window.location.href);
      for (const [key, value] of Object.entries(event.data.params)) {
        url.searchParams.set(key, String(value));
      }
      window.history.replaceState(null, '', url.toString());
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  window.addEventListener('message', handler);
  return () => window.removeEventListener('message', handler);
}
