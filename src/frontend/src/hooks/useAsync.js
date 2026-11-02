import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Runs an async loader on mount (and whenever `reload` is called) and exposes
 * { data, loading, error, reload }. The latest loader is always used, so callers
 * can pass an inline arrow function.
 */
export function useAsync(loader, initialData = null) {
  const [state, setState] = useState({ data: initialData, loading: true, error: null });
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const run = useCallback(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    loaderRef.current()
      .then((data) => { if (!cancelled) setState({ data, loading: false, error: null }); })
      .catch((err) => { if (!cancelled) setState((prev) => ({ ...prev, loading: false, error: err.message })); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => run(), [run]);

  return { ...state, reload: run };
}

