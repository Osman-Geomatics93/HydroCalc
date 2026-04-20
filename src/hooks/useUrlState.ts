import { useState, useEffect, useCallback, useRef } from 'react';

export function useUrlState(key: string, defaultValue: number, opts?: { pushHistory?: boolean }): [number, (v: number) => void];
export function useUrlState(key: string, defaultValue: string, opts?: { pushHistory?: boolean }): [string, (v: string) => void];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useUrlState(key: string, defaultValue: any, opts?: { pushHistory?: boolean }): [any, (v: any) => void] {
  const isNumber = typeof defaultValue === 'number';
  const pushHistory = opts?.pushHistory ?? false;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [value, setValue] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const param = params.get(key);
    if (param === null) return defaultValue;
    if (isNumber) {
      const n = Number(param);
      return isNaN(n) ? defaultValue : n;
    }
    return param;
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const strVal = String(value);
    if (strVal === String(defaultValue)) {
      params.delete(key);
    } else {
      params.set(key, strVal);
    }
    const search = params.toString();
    const url = window.location.pathname + (search ? `?${search}` : '');

    if (pushHistory) {
      // Debounce pushState to avoid flooding history on rapid input changes
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        window.history.pushState({ hydroSnapshot: true }, '', url);
      }, 600);
    } else {
      window.history.replaceState(null, '', url);
    }
  }, [key, value, defaultValue, pushHistory]);

  // Sync from popstate (browser back/forward)
  useEffect(() => {
    const handler = () => {
      const params = new URLSearchParams(window.location.search);
      const param = params.get(key);
      if (param === null) {
        setValue(defaultValue);
      } else if (isNumber) {
        const n = Number(param);
        setValue(isNaN(n) ? defaultValue : n);
      } else {
        setValue(param);
      }
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [key, defaultValue, isNumber]);

  const set = useCallback((v: number | string) => {
    setValue(v);
  }, []);

  return [value, set];
}
