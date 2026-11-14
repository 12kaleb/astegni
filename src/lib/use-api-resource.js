'use client';

import { useCallback, useEffect, useState } from 'react';

const identity = (value) => value;

/** Shared loading, empty-data, error, and refresh behavior for JSON API reads. */
export function useApiResource(url, select = identity, enabled = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    if (!enabled) return null;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(url, { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to load data.');
      const selected = select(result);
      setData(selected);
      return selected;
    } catch (cause) {
      setError(cause.message || 'Unable to load data.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [enabled, select, url]);

  useEffect(() => { reload(); }, [reload]);

  return { data, setData, loading, error, setError, reload };
}
